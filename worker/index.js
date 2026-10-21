/**
 * Cloudflare Worker for Ly Kuongkeat's Personal Tech Blog & CV
 *
 * Responsibilities:
 * 1. Serve React Single Page Application (SPA) with assets & index.html fallback
 * 2. POST /api/upload - Secure file upload directly to Cloudflare R2 with Supabase Admin JWT verification
 * 3. GET /cdn/* - Stream cached public images and PDFs directly from Cloudflare R2
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Set CORS headers helper
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // --------------------------------------------------------------------------
    // ROUTE 1: GET /cdn/* - Serve images and files from Cloudflare R2
    // --------------------------------------------------------------------------
    if (url.pathname.startsWith('/cdn/') && request.method === 'GET') {
      const objectKey = decodeURIComponent(url.pathname.replace(/^\/cdn\//, ''));

      if (!objectKey) {
        return new Response('File key is required', { status: 400, headers: corsHeaders });
      }

      try {
        const object = await env.BUCKET.get(objectKey);

        if (!object) {
          return new Response('File not found in storage', { status: 404, headers: corsHeaders });
        }

        const headers = new Headers(corsHeaders);
        object.writeHttpMetadata(headers);
        headers.set('ETag', object.httpEtag);
        // Cache static media at edge and browser for 1 year
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new Response(object.body, { headers });
      } catch (err) {
        return new Response('Error retrieving object from R2: ' + err.message, {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // --------------------------------------------------------------------------
    // ROUTE 2: POST /api/upload - Authenticated Upload to Cloudflare R2
    // --------------------------------------------------------------------------
    if (url.pathname === '/api/upload' && request.method === 'POST') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (!token) {
        return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      try {
        const supabaseUrl = env.SUPABASE_URL;
        const supabaseAnonKey = env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          return new Response(
            JSON.stringify({ error: 'SUPABASE_URL and SUPABASE_ANON_KEY must be configured in Worker environment variables' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        // 1. Verify user with Supabase Auth
        const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: supabaseAnonKey,
          },
        });

        if (!userRes.ok) {
          return new Response(JSON.stringify({ error: 'Invalid or expired auth session token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const authUser = await userRes.json();
        const userId = authUser.id;

        // 2. Verify admin status from public.profiles table
        const profileRes = await fetch(
          `${supabaseUrl}/rest/v1/profiles?select=is_admin&id=eq.${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: supabaseAnonKey,
            },
          }
        );

        const profileData = await profileRes.json();
        const isAdmin = Boolean(profileData?.[0]?.is_admin);

        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: Admin role required for file uploads.' }),
            { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        // 3. Parse Multipart Form Data
        const formData = await request.formData();
        const file = formData.get('file');
        const altText = formData.get('alt_text') || '';

        if (!file || typeof file === 'string') {
          return new Response(JSON.stringify({ error: 'No file provided in form-data' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // 4. Generate clean, collision-free object key
        const timestamp = Date.now();
        const cleanName = file.name
          .toLowerCase()
          .replace(/[^a-z0-9._-]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        const objectKey = `media/${timestamp}-${cleanName}`;

        // 5. Stream and store in Cloudflare R2
        await env.BUCKET.put(objectKey, file.stream(), {
          httpMetadata: {
            contentType: file.type || 'application/octet-stream',
          },
          customMetadata: {
            uploadedBy: userId,
            originalName: file.name,
          },
        });

        // Compute Public URL
        const publicUrl = `${url.origin}/cdn/${objectKey}`;

        // 6. Record in Supabase public.media table
        const mediaRecord = {
          uploaded_by: userId,
          object_key: objectKey,
          public_url: publicUrl,
          file_name: file.name,
          mime_type: file.type || 'application/octet-stream',
          size_bytes: file.size,
          alt_text: altText || file.name,
        };

        const dbRes = await fetch(`${supabaseUrl}/rest/v1/media`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: supabaseAnonKey,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(mediaRecord),
        });

        const createdMedia = await dbRes.json();

        return new Response(
          JSON.stringify({
            success: true,
            media: Array.isArray(createdMedia) ? createdMedia[0] : mediaRecord,
            public_url: publicUrl,
            object_key: objectKey,
          }),
          { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Internal upload error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // --------------------------------------------------------------------------
    // ROUTE 3: Serve React Frontend (SPA) with Cloudflare Static Assets
    // --------------------------------------------------------------------------
    if (env.ASSETS) {
      try {
        let response = await env.ASSETS.fetch(request);

        // If not found and not a static file extension, fallback to index.html for client-side routing
        if (response.status === 404 && !url.pathname.includes('.')) {
          const indexUrl = new URL('/index.html', request.url);
          response = await env.ASSETS.fetch(new Request(indexUrl, request));
        }

        return response;
      } catch (err) {
        return new Response('Asset fetch error: ' + err.message, { status: 500 });
      }
    }

    return new Response('Ly Kuongkeat Blog API & App running. Please configure static assets in wrangler.toml.', {
      status: 200,
    });
  },
};
