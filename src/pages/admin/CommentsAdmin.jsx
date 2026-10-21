import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Check, Trash2, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminComments, approveComment, deleteComment } from '../../lib/api';

export default function CommentsAdmin() {
  const [comments, setComments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getAdminComments({ status: statusFilter });
      setComments(data || []);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await approveComment(id);
      if (statusFilter === 'pending') {
        setComments((prev) => prev.filter((c) => c.id !== id));
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_approved: true } : c))
        );
      }
    } catch (err) {
      alert('Error approving comment: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert('Error deleting comment: ' + err.message);
    }
  };

  return (
    <AdminLayout
      title="Comment Moderation"
      subtitle="Review reader comments before they appear publicly on your blog articles."
    >
      <div className="space-y-6">
        
        {/* Status Tab Filter */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              statusFilter === 'pending'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            Pending Approval
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              statusFilter === 'approved'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              statusFilter === 'all'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            All Comments
          </button>
        </div>

        {/* Comments Feed / Table */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-400">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
              <MessageSquare className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                No comments found in this view.
              </p>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {c.author_name}
                    </span>
                    <span className="text-xs text-neutral-400">({c.author_email})</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      c.is_approved
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {c.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  <span className="text-xs text-neutral-400">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <span>Article:</span>
                    {c.posts?.slug ? (
                      <Link
                        to={`/post/${c.posts.slug}`}
                        target="_blank"
                        className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400 flex items-center gap-1"
                      >
                        {c.posts.title} <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span>Unknown article</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!c.is_approved && (
                      <button
                        onClick={() => handleApprove(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve Comment
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-950 dark:bg-rose-950/40 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
