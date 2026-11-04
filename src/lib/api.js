import { supabase } from './supabase';

/**
 * ============================================================================
 * POSTS API
 * ============================================================================
 */

export async function getPosts({
  page = 1,
  limit = 10,
  categorySlug = null,
  tagSlug = null,
  search = null,
  status = 'published',
  isAdmin = false,
} = {}) {
  try {
    let query = supabase
      .from('posts')
      .select(
        `
        id,
        author_id,
        category_id,
        title,
        slug,
        excerpt,
        content_format,
        cover_url,
        status,
        is_featured,
        views,
        reading_time,
        published_at,
        created_at,
        updated_at,
        categories ( id, name, slug ),
        profiles:author_id ( full_name, avatar_url ),
        post_tags (
          tags ( id, name, slug )
        )
      `,
        { count: 'exact' }
      );

    // Public only sees published posts unless admin specifies otherwise
    if (!isAdmin || status) {
      if (status !== 'all') {
        query = query.eq('status', status || 'published');
      }
    }

    if (search && search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    if (categorySlug) {
      // Get category ID first for strict filtering
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (cat) {
        query = query.eq('category_id', cat.id);
      } else {
        return { data: [], count: 0, totalPages: 0 };
      }
    }

    if (tagSlug) {
      // Get tag ID first
      const { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', tagSlug)
        .maybeSingle();

      if (tag) {
        const { data: taggedPosts } = await supabase
          .from('post_tags')
          .select('post_id')
          .eq('tag_id', tag.id);

        const postIds = (taggedPosts || []).map((tp) => tp.post_id);
        if (postIds.length === 0) {
          return { data: [], count: 0, totalPages: 0 };
        }
        query = query.in('id', postIds);
      } else {
        return { data: [], count: 0, totalPages: 0 };
      }
    }

    // Order newest first
    query = query.order('published_at', { ascending: false, nullsFirst: false });
    query = query.order('created_at', { ascending: false });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    // Normalize post tags for easier frontend consumption
    const formattedData = (data || []).map((post) => ({
      ...post,
      tags: (post.post_tags || []).map((pt) => pt.tags).filter(Boolean),
    }));

    return {
      data: formattedData,
      count: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      page,
      limit,
    };
  } catch (err) {
    console.error('getPosts error:', err);
    return { data: [], count: 0, totalPages: 0, error: err.message };
  }
}

export async function getPostBySlug(slug, { includeDraft = false } = {}) {
  try {
    let query = supabase
      .from('posts')
      .select(
        `
        id,
        author_id,
        category_id,
        title,
        slug,
        excerpt,
        content,
        content_format,
        cover_url,
        status,
        is_featured,
        views,
        reading_time,
        published_at,
        created_at,
        updated_at,
        categories ( id, name, slug, description ),
        profiles:author_id ( full_name, avatar_url, bio ),
        post_tags (
          tags ( id, name, slug )
        )
      `
      )
      .eq('slug', slug);

    if (!includeDraft) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return null;

    // Increment view count asynchronously in background
    incrementPostViews(data.id);

    return {
      ...data,
      tags: (data.post_tags || []).map((pt) => pt.tags).filter(Boolean),
    };
  } catch (err) {
    console.error('getPostBySlug error:', err);
    return null;
  }
}

export async function getPostById(id) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        id,
        author_id,
        category_id,
        title,
        slug,
        excerpt,
        content,
        content_format,
        cover_url,
        status,
        is_featured,
        views,
        reading_time,
        published_at,
        created_at,
        updated_at,
        categories ( id, name, slug ),
        post_tags (
          tags ( id, name, slug )
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      ...data,
      tags: (data.post_tags || []).map((pt) => pt.tags).filter(Boolean),
    };
  } catch (err) {
    console.error('getPostById error:', err);
    throw err;
  }
}

export async function createPost(postData, tagIds = []) {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) throw error;

    if (tagIds && tagIds.length > 0) {
      const postTagRecords = tagIds.map((tagId) => ({
        post_id: post.id,
        tag_id: tagId,
      }));
      const { error: tagError } = await supabase.from('post_tags').insert(postTagRecords);
      if (tagError) console.error('Error inserting post tags:', tagError);
    }

    return post;
  } catch (err) {
    console.error('createPost error:', err);
    throw err;
  }
}

export async function updatePost(id, postData, tagIds = null) {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .update({
        ...postData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (Array.isArray(tagIds)) {
      // Sync tags: delete existing post_tags, then insert new ones
      await supabase.from('post_tags').delete().eq('post_id', id);

      if (tagIds.length > 0) {
        const postTagRecords = tagIds.map((tagId) => ({
          post_id: id,
          tag_id: tagId,
        }));
        await supabase.from('post_tags').insert(postTagRecords);
      }
    }

    return post;
  } catch (err) {
    console.error('updatePost error:', err);
    throw err;
  }
}

export async function deletePost(id) {
  try {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deletePost error:', err);
    throw err;
  }
}

export async function incrementPostViews(postId) {
  try {
    // Call the security definer RPC function created in Step 1
    const { error } = await supabase.rpc('increment_post_views', { p_post_id: postId });
    if (error) {
      // Fallback in case RPC is not yet created
      console.warn('increment_post_views RPC unavailable:', error.message);
    }
  } catch (err) {
    console.warn('incrementPostViews failed silently:', err.message);
  }
}

/**
 * ============================================================================
 * CATEGORIES API
 * ============================================================================
 */

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, created_at')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getCategories error:', err);
    return [];
  }
}

export async function getCategoryBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('getCategoryBySlug error:', err);
    return null;
  }
}

export async function createCategory({ name, slug, description = '' }) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, slug, description }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('createCategory error:', err);
    throw err;
  }
}

export async function updateCategory(id, { name, slug, description = '' }) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ name, slug, description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('updateCategory error:', err);
    throw err;
  }
}

export async function deleteCategory(id) {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteCategory error:', err);
    throw err;
  }
}

/**
 * ============================================================================
 * TAGS API
 * ============================================================================
 */

export async function getTags() {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getTags error:', err);
    return [];
  }
}

export async function getTagBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('getTagBySlug error:', err);
    return null;
  }
}

export async function getOrCreateTags(tagNames) {
  try {
    const results = [];
    for (const rawName of tagNames) {
      const name = rawName.trim();
      if (!name) continue;

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Check if tag exists
      let { data: existingTag } = await supabase
        .from('tags')
        .select('id, name, slug')
        .eq('slug', slug)
        .maybeSingle();

      if (!existingTag) {
        const { data: newTag, error } = await supabase
          .from('tags')
          .insert([{ name, slug }])
          .select()
          .single();

        if (error) {
          console.error('Error creating tag:', error);
          continue;
        }
        existingTag = newTag;
      }
      results.push(existingTag);
    }
    return results;
  } catch (err) {
    console.error('getOrCreateTags error:', err);
    return [];
  }
}

/**
 * ============================================================================
 * COMMENTS API
 * ============================================================================
 */

export async function getPostComments(postId) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('id, post_id, parent_id, author_name, author_email, content, is_approved, created_at')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getPostComments error:', err);
    return [];
  }
}

export async function createComment({ postId, parentId = null, authorName, authorEmail, content }) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          parent_id: parentId,
          author_name: authorName,
          author_email: authorEmail,
          content: content,
          is_approved: false, // Hidden until admin approves
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('createComment error:', err);
    throw err;
  }
}

export async function getAdminComments({ status = 'pending' } = {}) {
  try {
    let query = supabase
      .from('comments')
      .select(
        `
        id,
        post_id,
        parent_id,
        author_name,
        author_email,
        content,
        is_approved,
        created_at,
        posts ( id, title, slug )
      `
      )
      .order('created_at', { ascending: false });

    if (status === 'pending') {
      query = query.eq('is_approved', false);
    } else if (status === 'approved') {
      query = query.eq('is_approved', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getAdminComments error:', err);
    return [];
  }
}

export async function approveComment(id) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ is_approved: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('approveComment error:', err);
    throw err;
  }
}

export async function deleteComment(id) {
  try {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteComment error:', err);
    throw err;
  }
}

/**
 * ============================================================================
 * ADS API
 * ============================================================================
 */

export async function getActiveAdsBySlot(slot) {
  try {
    const now = new Date().toISOString();
    let query = supabase
      .from('ads')
      .select(
        'id, name, slot, ad_type, image_url, link_url, script_code, width, height, position, is_active, starts_at, ends_at'
      )
      .eq('slot', slot)
      .eq('is_active', true)
      .order('position', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    // Filter date ranges client-side as well for extra precision
    const filtered = (data || []).filter((ad) => {
      if (ad.starts_at && new Date(ad.starts_at) > new Date(now)) return false;
      if (ad.ends_at && new Date(ad.ends_at) < new Date(now)) return false;
      return true;
    });

    return filtered;
  } catch (err) {
    console.error('getActiveAdsBySlot error:', err);
    return [];
  }
}

export async function getAllAds() {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getAllAds error:', err);
    return [];
  }
}

export async function createAd(adData) {
  try {
    const { data, error } = await supabase.from('ads').insert([adData]).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('createAd error:', err);
    throw err;
  }
}

export async function updateAd(id, adData) {
  try {
    const { data, error } = await supabase
      .from('ads')
      .update(adData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('updateAd error:', err);
    throw err;
  }
}

export async function deleteAd(id) {
  try {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteAd error:', err);
    throw err;
  }
}

export async function recordAdImpression(adId) {
  try {
    await supabase.rpc('increment_ad_impressions', { p_ad_id: adId });
  } catch (err) {
    console.warn('recordAdImpression error:', err.message);
  }
}

export async function recordAdClick(adId) {
  try {
    await supabase.rpc('increment_ad_clicks', { p_ad_id: adId });
  } catch (err) {
    console.warn('recordAdClick error:', err.message);
  }
}

/**
 * ============================================================================
 * MEDIA API
 * ============================================================================
 */

export async function getMediaList({ page = 1, limit = 24 } = {}) {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
      .from('media')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data || [], count: count || 0, totalPages: Math.ceil((count || 0) / limit) };
  } catch (err) {
    console.error('getMediaList error:', err);
    return { data: [], count: 0, totalPages: 0 };
  }
}

export async function createMediaRecord(mediaData) {
  try {
    const { data, error } = await supabase.from('media').insert([mediaData]).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('createMediaRecord error:', err);
    throw err;
  }
}

export async function deleteMediaRecord(id) {
  try {
    const { error } = await supabase.from('media').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteMediaRecord error:', err);
    throw err;
  }
}

function compressImageToDataUrl(file, maxSize = 512, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(outputType, quality));
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export async function uploadMediaFile(file, altText = '') {
  const clientSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const clientSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const attemptR2Upload = async (token) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt_text', altText || file.name);

    return fetch('/api/upload', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(clientSupabaseUrl ? { 'x-supabase-url': clientSupabaseUrl } : {}),
        ...(clientSupabaseKey ? { 'x-supabase-anon-key': clientSupabaseKey } : {}),
      },
      body: formData,
    });
  };

  let activeUser = null;

  try {
    let {
      data: { session },
    } = await supabase.auth.getSession();

    const nowSec = Math.floor(Date.now() / 1000);
    if (!session || (session.expires_at && session.expires_at - nowSec < 120)) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      if (refreshed?.session) {
        session = refreshed.session;
      }
    }

    activeUser = session?.user || null;
    let token = session?.access_token;

    let response = await attemptR2Upload(token);

    // If token was rejected as expired/invalid, force a session refresh and retry once
    if (response.status === 401) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      if (refreshed?.session?.access_token) {
        token = refreshed.session.access_token;
        activeUser = refreshed.session.user || activeUser;
        response = await attemptR2Upload(token);
      }
    }

    if (response.ok) {
      const result = await response.json();
      const publicUrl = result.public_url || result.media?.public_url;
      if (publicUrl) {
        return { public_url: publicUrl, media: result.media || null, source: 'r2' };
      }
    }
  } catch (err) {
    console.warn('R2 worker upload fallback triggered:', err.message);
  }

  // Fallback for images when Worker R2 endpoint or Worker env vars are unavailable
  if (file.type && file.type.startsWith('image/')) {
    const dataUrl = await compressImageToDataUrl(file, 720, 0.85);
    let createdRecord = null;
    try {
      const timestamp = Date.now();
      const cleanName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      createdRecord = await createMediaRecord({
        uploaded_by: activeUser?.id || null,
        object_key: `inline/${timestamp}-${cleanName}`,
        public_url: dataUrl,
        file_name: file.name,
        mime_type: file.type || 'image/jpeg',
        size_bytes: file.size || 0,
        alt_text: altText || file.name,
      });
    } catch (dbErr) {
      console.warn('Could not insert fallback media record:', dbErr.message);
    }
    return { public_url: dataUrl, media: createdRecord, source: 'local' };
  }

  throw new Error('Upload failed. Please sign out and sign back in, or check Cloudflare Worker R2 configuration.');
}


/**
 * ============================================================================
 * CV API (cv_sections and cv_items)
 * ============================================================================
 */

export async function getCVData({ includeHidden = false } = {}) {
  try {
    let query = supabase
      .from('cv_sections')
      .select(
        `
        id,
        key,
        title,
        icon,
        position,
        is_visible,
        cv_items (
          id,
          section_id,
          label,
          value,
          subtitle,
          url,
          position
        )
      `
      )
      .order('position', { ascending: true });

    if (!includeHidden) {
      query = query.eq('is_visible', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Order items within each section
    return (data || []).map((sec) => ({
      ...sec,
      items: (sec.cv_items || []).sort((a, b) => (a.position || 0) - (b.position || 0)),
    }));
  } catch (err) {
    console.error('getCVData error:', err);
    return [];
  }
}

export async function createCVSection(sectionData) {
  try {
    const { data, error } = await supabase
      .from('cv_sections')
      .insert([sectionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('createCVSection error:', err);
    throw err;
  }
}

export async function updateCVSection(id, sectionData) {
  try {
    const { data, error } = await supabase
      .from('cv_sections')
      .update(sectionData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('updateCVSection error:', err);
    throw err;
  }
}

export async function deleteCVSection(id) {
  try {
    const { error } = await supabase.from('cv_sections').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteCVSection error:', err);
    throw err;
  }
}

export async function createCVItem(itemData) {
  try {
    const { data, error } = await supabase
      .from('cv_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('createCVItem error:', err);
    throw err;
  }
}

export async function updateCVItem(id, itemData) {
  try {
    const { data, error } = await supabase
      .from('cv_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('updateCVItem error:', err);
    throw err;
  }
}

export async function deleteCVItem(id) {
  try {
    const { error } = await supabase.from('cv_items').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteCVItem error:', err);
    throw err;
  }
}

/**
 * ============================================================================
 * SITE SETTINGS API
 * ============================================================================
 */

export async function getSiteSettings(key = 'general') {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value, updated_at')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return data?.value || null;
  } catch (err) {
    console.error('getSiteSettings error:', err);
    return null;
  }
}

export async function updateSiteSettings(key, value) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data?.value;
  } catch (err) {
    console.error('updateSiteSettings error:', err);
    throw err;
  }
}

/**
 * ============================================================================
 * NEWSLETTER SUBSCRIBERS API
 * ============================================================================
 */

export async function subscribeNewsletter(email) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email: cleanEmail, is_active: true }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation (already subscribed)
        return { success: true, message: 'You are already subscribed!' };
      }
      throw error;
    }
    return { success: true, message: 'Thank you for subscribing!', data };
  } catch (err) {
    console.error('subscribeNewsletter error:', err);
    throw err;
  }
}

export async function getSubscribers() {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getSubscribers error:', err);
    return [];
  }
}

export async function deleteSubscriber(id) {
  try {
    const { error } = await supabase.from('subscribers').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteSubscriber error:', err);
    throw err;
  }
}

/**
 * ============================================================================
 * CONTACT MESSAGES API
 * ============================================================================
 */

export async function sendContactMessage({ name, email, subject, message }) {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          is_read: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('sendContactMessage error:', err);
    throw err;
  }
}

export async function getContactMessages() {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getContactMessages error:', err);
    return [];
  }
}

export async function markMessageRead(id, is_read = true) {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ is_read })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('markMessageRead error:', err);
    throw err;
  }
}

export async function deleteContactMessage(id) {
  try {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteContactMessage error:', err);
    throw err;
  }
}

/**
 * ============================================================================
 * DASHBOARD METRICS API (ADMIN)
 * ============================================================================
 */

export async function getDashboardStats() {
  try {
    const [
      publishedPosts,
      draftPosts,
      pendingComments,
      activeAds,
      subscribersCount,
      unreadMessages,
    ] = await Promise.all([
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'draft'),
      supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('is_approved', false),
      supabase
        .from('ads')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false),
    ]);

    return {
      publishedPosts: publishedPosts.count || 0,
      draftPosts: draftPosts.count || 0,
      pendingComments: pendingComments.count || 0,
      activeAds: activeAds.count || 0,
      subscribersCount: subscribersCount.count || 0,
      unreadMessages: unreadMessages.count || 0,
    };
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return {
      publishedPosts: 0,
      draftPosts: 0,
      pendingComments: 0,
      activeAds: 0,
      subscribersCount: 0,
      unreadMessages: 0,
    };
  }
}
