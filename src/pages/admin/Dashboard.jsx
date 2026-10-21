import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  FileEdit, 
  MessageSquare, 
  Megaphone, 
  Users, 
  Mail, 
  ArrowRight, 
  Check, 
  Trash2, 
  Eye, 
  PlusCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  getDashboardStats, 
  getAdminComments, 
  approveComment, 
  deleteComment, 
  getPosts 
} from '../../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    publishedPosts: 0,
    draftPosts: 0,
    pendingComments: 0,
    activeAds: 0,
    subscribersCount: 0,
    unreadMessages: 0,
  });

  const [pendingComments, setPendingComments] = useState([]);
  const [draftPosts, setDraftPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      try {
        const [statsData, commentsData, draftsData] = await Promise.all([
          getDashboardStats(),
          getAdminComments({ status: 'pending' }),
          getPosts({ page: 1, limit: 5, status: 'draft', isAdmin: true }),
        ]);

        if (mounted) {
          setStats(statsData);
          setPendingComments((commentsData || []).slice(0, 5));
          setDraftPosts(draftsData?.data || []);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleApproveComment = async (id) => {
    try {
      await approveComment(id);
      setPendingComments((prev) => prev.filter((c) => c.id !== id));
      setStats((prev) => ({
        ...prev,
        pendingComments: Math.max(0, prev.pendingComments - 1),
      }));
    } catch (err) {
      alert('Error approving comment: ' + err.message);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(id);
      setPendingComments((prev) => prev.filter((c) => c.id !== id));
      setStats((prev) => ({
        ...prev,
        pendingComments: Math.max(0, prev.pendingComments - 1),
      }));
    } catch (err) {
      alert('Error deleting comment: ' + err.message);
    }
  };

  const statCards = [
    {
      label: 'Published Posts',
      value: stats.publishedPosts,
      icon: FileText,
      color: 'emerald',
      link: '/admin/posts',
    },
    {
      label: 'Draft Articles',
      value: stats.draftPosts,
      icon: FileEdit,
      color: 'amber',
      link: '/admin/posts',
    },
    {
      label: 'Pending Comments',
      value: stats.pendingComments,
      icon: MessageSquare,
      color: 'blue',
      link: '/admin/comments',
      badge: stats.pendingComments > 0 ? 'Action needed' : null,
    },
    {
      label: 'Active Ads',
      value: stats.activeAds,
      icon: Megaphone,
      color: 'purple',
      link: '/admin/ads',
    },
    {
      label: 'Subscribers',
      value: stats.subscribersCount,
      icon: Users,
      color: 'sky',
      link: '/admin/settings',
    },
    {
      label: 'Unread Messages',
      value: stats.unreadMessages,
      icon: Mail,
      color: 'rose',
      link: '/admin/messages',
      badge: stats.unreadMessages > 0 ? 'New' : null,
    },
  ];

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Overview of blog metrics, incoming comments, and publishing workflow."
    >
      <div className="space-y-8">
        
        {/* KPI Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                to={card.link}
                className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-xs dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-neutral-100 p-2 text-neutral-800 transition group-hover:scale-105 dark:bg-neutral-800 dark:text-neutral-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  {card.badge && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                      {card.badge}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <span className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    {loading ? '...' : card.value}
                  </span>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 truncate">
                    {card.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <PlusCircle className="h-4 w-4" />
            Write New Post
          </Link>
          <Link
            to="/admin/ads"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Megaphone className="h-4 w-4 text-purple-600" />
            Manage Ads
          </Link>
          <Link
            to="/admin/cv"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <FileText className="h-4 w-4 text-emerald-600" />
            Update CV Rows
          </Link>
          <Link
            to="/admin/media"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Media Library
          </Link>
        </div>

        {/* Two-column layout for Comments and Drafts */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          {/* 1. Comments Waiting for Approval */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Pending Comments ({pendingComments.length})
                </h3>
              </div>
              <Link
                to="/admin/comments"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <p className="text-xs text-neutral-400">Loading comments...</p>
            ) : pendingComments.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center dark:text-neutral-400 italic">
                No comments waiting for approval.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3.5 space-y-2 dark:border-neutral-800 dark:bg-neutral-900/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {comment.author_name}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2">
                      &ldquo;{comment.content}&rdquo;
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-neutral-500 truncate max-w-[200px]">
                        on: {comment.posts?.title || 'Article'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveComment(comment.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 transition"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Draft Articles Waiting for Publishing */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Draft Articles ({draftPosts.length})
                </h3>
              </div>
              <Link
                to="/admin/posts"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <p className="text-xs text-neutral-400">Loading drafts...</p>
            ) : draftPosts.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center dark:text-neutral-400 italic">
                No drafts currently in progress.
              </p>
            ) : (
              <div className="space-y-3">
                {draftPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60"
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {post.title}
                      </h4>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        Updated {new Date(post.updated_at).toLocaleDateString()}
                      </p>
                    </div>

                    <Link
                      to={`/admin/posts/edit/${post.id}`}
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      Continue editing
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
