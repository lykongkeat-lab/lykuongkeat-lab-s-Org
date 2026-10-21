import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Eye, 
  Clock, 
  CheckCircle, 
  FileEdit, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getPosts, deletePost, updatePost, getCategories } from '../../lib/api';

export default function PostsAdmin() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const limit = 10;

  useEffect(() => {
    let mounted = true;
    getCategories().then((data) => {
      if (mounted) setCategories(data || []);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await getPosts({
        page,
        limit,
        status: statusFilter === 'all' ? 'all' : statusFilter,
        categorySlug: categoryFilter || null,
        search: searchQuery || null,
        isAdmin: true,
      });

      setPosts(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error('Error fetching admin posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page, statusFilter, categoryFilter, searchQuery]);

  const handleDelete = async (post) => {
    if (!window.confirm(`Are you sure you want to delete "${post.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert('Failed to delete post: ' + err.message);
    }
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const updatePayload = {
      status: newStatus,
      published_at: newStatus === 'published' ? post.published_at || new Date().toISOString() : post.published_at,
    };

    try {
      await updatePost(post.id, updatePayload);
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, ...updatePayload } : p))
      );
    } catch (err) {
      alert('Failed to update post status: ' + err.message);
    }
  };

  const handleToggleFeatured = async (post) => {
    const is_featured = !post.is_featured;
    try {
      await updatePost(post.id, { is_featured });
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, is_featured } : p))
      );
    } catch (err) {
      alert('Failed to toggle featured status: ' + err.message);
    }
  };

  return (
    <AdminLayout
      title="Articles &amp; Posts"
      subtitle="Manage all blog articles, publish status, and featured highlights."
    >
      <div className="space-y-6">
        
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search articles by title..."
                className="w-full rounded-xl border border-neutral-300 bg-white py-2 pl-9 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/admin/posts/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <PlusCircle className="h-4 w-4" />
            New Article
          </Link>
        </div>

        {/* Posts Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-300">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Article
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Views
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Published / Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-neutral-400">
                      Loading articles...
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-neutral-400">
                      No articles found matching your filters.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr
                      key={post.id}
                      className="transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40"
                    >
                      {/* Title + Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.cover_url ? (
                            <img
                              src={post.cover_url}
                              alt=""
                              className="h-10 w-14 shrink-0 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800"
                            />
                          ) : (
                            <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
                              <FileEdit className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-sm">
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/admin/posts/edit/${post.id}`}
                                className="font-bold text-neutral-900 transition hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 truncate"
                              >
                                {post.title}
                              </Link>
                              <button
                                onClick={() => handleToggleFeatured(post)}
                                title={post.is_featured ? 'Featured post' : 'Mark as featured'}
                                className={`shrink-0 ${
                                  post.is_featured ? 'text-amber-500' : 'text-neutral-300 hover:text-neutral-400 dark:text-neutral-700'
                                }`}
                              >
                                <Star className="h-3.5 w-3.5 fill-current" />
                              </button>
                            </div>
                            <p className="truncate text-[11px] text-neutral-400">
                              /post/{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        {post.categories?.name ? (
                          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            {post.categories.name}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(post)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                            post.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {post.status === 'published' ? (
                            <>
                              <CheckCircle className="h-3 w-3" /> Published
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" /> Draft
                            </>
                          )}
                        </button>
                      </td>

                      {/* Views */}
                      <td className="px-6 py-4 font-mono text-[11px]">
                        {post.views || 0}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-[11px] text-neutral-500 dark:text-neutral-400">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Not published'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.status === 'published' && (
                            <Link
                              to={`/post/${post.slug}`}
                              target="_blank"
                              title="View on live blog"
                              className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          <Link
                            to={`/admin/posts/edit/${post.id}`}
                            title="Edit Article"
                            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post)}
                            title="Delete Article"
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Showing page {page} of {totalPages} ({totalCount} total articles)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
