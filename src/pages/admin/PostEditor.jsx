import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Eye, 
  Edit3, 
  Columns, 
  Image as ImageIcon, 
  Clock, 
  Tag as TagIcon, 
  Folder, 
  Check, 
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  getPostById, 
  createPost, 
  updatePost, 
  getCategories, 
  getOrCreateTags 
} from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

export default function PostEditor() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editor mode: 'edit' | 'preview' | 'split'
  const [viewMode, setViewMode] = useState('split');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [contentFormat, setContentFormat] = useState('markdown'); // 'markdown' or 'html'
  const [categoryId, setCategoryId] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [status, setStatus] = useState('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [readingTime, setReadingTime] = useState(3);
  const [tagsInput, setTagsInput] = useState('');

  // Load categories
  useEffect(() => {
    let mounted = true;
    getCategories().then((data) => {
      if (mounted && data) {
        setCategories(data);
        if (!isEditing && data.length > 0) {
          setCategoryId(data[0].id);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [isEditing]);

  // Load existing post if editing
  useEffect(() => {
    if (!isEditing) return;

    let mounted = true;
    setLoading(true);

    getPostById(id)
      .then((post) => {
        if (!mounted || !post) return;
        setTitle(post.title || '');
        setSlug(post.slug || '');
        setAutoSlug(false);
        setExcerpt(post.excerpt || '');
        setContent(post.content || '');
        setContentFormat(post.content_format || 'markdown');
        setCategoryId(post.category_id || '');
        setCoverUrl(post.cover_url || '');
        setStatus(post.status || 'draft');
        setIsFeatured(Boolean(post.is_featured));
        setReadingTime(post.reading_time || 3);
        const tagNames = (post.tags || []).map((t) => t.name).join(', ');
        setTagsInput(tagNames);
      })
      .catch((err) => {
        console.error('Failed to load post for editing:', err);
        setErrorMsg('Failed to load article data: ' + err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, isEditing]);

  // Auto-generate slug when title changes
  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    if (autoSlug) {
      const generated = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  // Auto-calculate reading time when content changes
  const handleContentChange = (newContent) => {
    setContent(newContent);
    const words = newContent.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setReadingTime(minutes);
  };

  // Render preview safely with DOMPurify
  const renderPreviewHtml = () => {
    try {
      const rawHtml =
        contentFormat === 'html'
          ? content
          : marked.parse(content || '*No content written yet.*');

      return DOMPurify.sanitize(rawHtml, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
      });
    } catch (err) {
      return `<p class="text-rose-500">Preview error: ${err.message}</p>`;
    }
  };

  const handleSubmit = async (targetStatus) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter an article title.');
      return;
    }

    if (!slug.trim()) {
      setErrorMsg('Please specify an article URL slug.');
      return;
    }

    setSaving(true);

    try {
      // 1. Process tags
      const rawTagList = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const tagRecords = await getOrCreateTags(rawTagList);
      const tagIds = tagRecords.map((t) => t.id);

      // 2. Prepare post payload
      const postPayload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content: content,
        content_format: contentFormat,
        category_id: categoryId || null,
        cover_url: coverUrl.trim() || null,
        status: targetStatus,
        is_featured: isFeatured,
        reading_time: readingTime || 1,
        author_id: user?.id || null,
      };

      if (targetStatus === 'published') {
        postPayload.published_at = new Date().toISOString();
      }

      if (isEditing) {
        await updatePost(id, postPayload, tagIds);
        setSuccessMsg('Article updated successfully!');
      } else {
        const created = await createPost(postPayload, tagIds);
        setSuccessMsg('Article created successfully!');
        navigate(`/admin/posts/edit/${created.id}`, { replace: true });
      }

      setStatus(targetStatus);
    } catch (err) {
      console.error('Save post error:', err);
      setErrorMsg(err.message || 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEditing ? 'Edit Article' : 'New Article'}>
        <div className="flex h-64 items-center justify-center">
          <p className="text-xs text-neutral-400">Loading article editor...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEditing ? `Editing: ${title || 'Article'}` : 'Write New Article'}
      subtitle="Full-featured Markdown and HTML editor with live preview and SEO controls."
    >
      <div className="space-y-6">
        
        {/* Navigation / Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            to="/admin/posts"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All Articles
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {isEditing && status === 'published' && (
              <Link
                to={`/post/${slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View Live
              </Link>
            )}

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('draft')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <Save className="h-3.5 w-3.5" />
              {status === 'draft' ? 'Save Draft' : 'Unpublish to Draft'}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('published')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60"
            >
              <Send className="h-3.5 w-3.5" />
              {status === 'published' ? 'Update Published Article' : 'Publish Article'}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Grid: Left editor, Right metadata */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Main Content & Title (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Title & Slug */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Solving Memory Leaks in Large Scale React Apps"
                  className="w-full text-xl sm:text-2xl font-bold rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    URL Slug *
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-neutral-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSlug}
                      onChange={(e) => setAutoSlug(e.target.checked)}
                      className="rounded"
                    />
                    Auto-sync with title
                  </label>
                </div>
                <div className="flex items-center rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400">
                  <span>/post/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setAutoSlug(false);
                    }}
                    placeholder="solving-memory-leaks-in-react"
                    className="flex-1 bg-transparent pl-1 font-mono text-neutral-900 focus:outline-hidden dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief 1-2 sentence overview shown on the home page and in meta cards..."
                  className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
                />
              </div>
            </div>

            {/* Content Editor with View Mode Switcher */}
            <div className="rounded-3xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-3 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-900/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Content
                  </span>
                  {/* Format Toggle */}
                  <div className="flex rounded-lg border border-neutral-300 bg-white p-0.5 text-[11px] font-semibold dark:border-neutral-700 dark:bg-neutral-900">
                    <button
                      type="button"
                      onClick={() => setContentFormat('markdown')}
                      className={`px-2 py-0.5 rounded ${
                        contentFormat === 'markdown'
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentFormat('html')}
                      className={`px-2 py-0.5 rounded ${
                        contentFormat === 'html'
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      HTML
                    </button>
                  </div>
                </div>

                {/* View Mode controls */}
                <div className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white p-0.5 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900">
                  <button
                    type="button"
                    onClick={() => setViewMode('edit')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded ${
                      viewMode === 'edit'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded ${
                      viewMode === 'split'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    <Columns className="h-3 w-3" /> Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded ${
                      viewMode === 'preview'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                </div>
              </div>

              {/* Editor / Preview Body */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
                {/* Code / Text Input */}
                {(viewMode === 'edit' || viewMode === 'split') && (
                  <div className={`${viewMode === 'split' ? 'lg:col-span-6 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800' : 'lg:col-span-12'}`}>
                    <textarea
                      rows={24}
                      value={content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder={
                        contentFormat === 'markdown'
                          ? '# Write your markdown article here...\n\nUse code blocks, lists, headers, etc.'
                          : '<h1>Write your raw HTML article here...</h1>'
                      }
                      className="w-full h-full p-4 font-mono text-xs sm:text-sm leading-relaxed text-neutral-900 placeholder-neutral-400 focus:outline-hidden dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-600 resize-none"
                    />
                  </div>
                )}

                {/* Live Sanitized Preview */}
                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} p-6 bg-white dark:bg-neutral-900 overflow-y-auto max-h-[600px]`}>
                    <div
                      className="prose prose-neutral prose-sm dark:prose-invert max-w-none leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderPreviewHtml() }}
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Sidebar Settings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Status & Featured Box */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Publishing Details
              </h3>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Current Status
                </label>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                    status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}>
                    {status}
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Mark as Featured Post (Hero banner)
              </label>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Estimated Reading Time
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  <input
                    type="number"
                    min={1}
                    value={readingTime}
                    onChange={(e) => setReadingTime(parseInt(e.target.value, 10) || 1)}
                    className="w-20 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                  <span className="text-xs text-neutral-500">minutes</span>
                </div>
              </div>
            </div>

            {/* Category Selector */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Category *
                </h3>
              </div>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="pt-2 text-[11px] text-neutral-400">
                Manage or add new categories in the{' '}
                <Link to="/admin/categories" className="underline hover:text-neutral-700 dark:hover:text-white">
                  Categories panel
                </Link>
                .
              </div>
            </div>

            {/* Tags Input */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Tags
                </h3>
              </div>

              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="react, performance, debugging (comma separated)"
                className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
              />
              <p className="text-[11px] text-neutral-400">
                Separate tags by commas. Unregistered tags are automatically created.
              </p>
            </div>

            {/* Cover Image URL */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Cover Image
                </h3>
              </div>

              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://... image URL (or Cloudflare R2 URL)"
                className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500"
              />

              {coverUrl ? (
                <div className="overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={coverUrl}
                    alt="Cover Preview"
                    className="h-32 w-full object-cover"
                    onError={() => {}}
                  />
                </div>
              ) : (
                <p className="text-[11px] text-neutral-400">
                  Upload files via the{' '}
                  <Link to="/admin/media" className="underline hover:text-neutral-700 dark:hover:text-white">
                    Media Library
                  </Link>{' '}
                  and paste the URL here.
                </p>
              )}
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
