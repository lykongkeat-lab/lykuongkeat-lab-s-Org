import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { 
  Calendar, 
  Clock, 
  Eye, 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Share2,
  Bookmark
} from 'lucide-react';
import Layout from '../components/Layout';
import AdSlot from '../components/AdSlot';
import { getPostBySlug, getPostComments, createComment } from '../lib/api';

export default function PostDetail() {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comment submission form
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    content: '',
  });
  const [commentStatus, setCommentStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function loadPostAndComments() {
      try {
        const postData = await getPostBySlug(slug);
        if (mounted && postData) {
          setPost(postData);

          const commentsData = await getPostComments(postData.id);
          if (mounted) {
            setComments(commentsData || []);
          }
        }
      } catch (err) {
        console.error('Error loading post:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPostAndComments();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.name.trim() || !commentForm.email.trim() || !commentForm.content.trim()) {
      setCommentStatus({ state: 'error', message: 'Please fill in all comment fields.' });
      return;
    }

    setCommentStatus({ state: 'submitting', message: '' });
    try {
      await createComment({
        postId: post.id,
        authorName: commentForm.name.trim(),
        authorEmail: commentForm.email.trim(),
        content: commentForm.content.trim(),
      });

      setCommentStatus({
        state: 'success',
        message: 'Your comment has been submitted! It will appear once approved by the admin.',
      });

      setCommentForm({ name: '', email: '', content: '' });
    } catch (err) {
      setCommentStatus({
        state: 'error',
        message: err.message || 'Failed to submit comment. Please try again.',
      });
    }
  };

  // Convert and sanitize content safely
  const renderContent = () => {
    if (!post?.content) return '';
    try {
      const rawHtml =
        post.content_format === 'html'
          ? post.content
          : marked.parse(post.content);

      // DOMPurify XSS filter
      return DOMPurify.sanitize(rawHtml, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
      });
    } catch (err) {
      console.error('Content formatting error:', err);
      return post.content;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-12 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-64 w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-4/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Article Not Found</h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            The article you are looking for does not exist or may have been unposted.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Articles
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to all articles
          </Link>
        </div>

        {/* Post Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {post.categories?.name && (
              <Link
                to={`/category/${post.categories.slug}`}
                className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                {post.categories.name}
              </Link>
            )}
            <span className="text-xs text-neutral-400">•</span>
            <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Calendar className="h-3.5 w-3.5" />
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Draft'}
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_time || 3} min read
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <Eye className="h-3.5 w-3.5" />
              {post.views || 0} views
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
              {post.excerpt}
            </p>
          )}

          {/* Author Details */}
          <div className="flex items-center gap-3 border-y border-neutral-200 py-4 dark:border-neutral-800">
            <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-neutral-200 dark:ring-neutral-700">
              <img
                src={
                  post.profiles?.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                }
                alt={post.profiles?.full_name || 'Author'}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {post.profiles?.full_name || 'Ly Kuongkeat'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Author &amp; Software Engineer
              </p>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.cover_url && (
          <div className="overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full object-cover max-h-[480px]"
            />
          </div>
        )}

        {/* Advertisement Slot: in_article */}
        <AdSlot slot="in_article" />

        {/* Main Article Body (DOMPurify Sanitized) */}
        <div
          className="prose prose-neutral prose-lg dark:prose-invert max-w-none leading-relaxed
            prose-headings:font-bold prose-headings:tracking-tight 
            prose-a:text-emerald-600 hover:prose-a:text-emerald-500 dark:prose-a:text-emerald-400
            prose-code:text-emerald-600 dark:prose-code:text-emerald-400 prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 dark:prose-pre:bg-neutral-900"
          dangerouslySetInnerHTML={{ __html: renderContent() }}
        />

        {/* Advertisement Slot: below_post */}
        <AdSlot slot="below_post" />

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Tags:
              </span>
              {post.tags.map((t) => (
                <Link
                  key={t.id}
                  to={`/tag/${t.slug}`}
                  className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <section className="border-t border-neutral-200 pt-10 space-y-8 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              Comments ({comments.length})
            </h3>
          </div>

          {/* Existing Approved Comments */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm italic text-neutral-500 dark:text-neutral-400">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 space-y-2 dark:border-neutral-800 dark:bg-neutral-900/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
              Leave a Comment
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Your email will remain private. Comments are reviewed by the author before appearing publicly.
            </p>

            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                    placeholder="e.g. Sokha"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={commentForm.email}
                    onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                    placeholder="sokha@domain.com"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Comment *
                </label>
                <textarea
                  required
                  rows={4}
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  placeholder="Share your thoughts, suggestions, or questions..."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={commentStatus.state === 'submitting'}
                  className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  <Send className="h-4 w-4" />
                  {commentStatus.state === 'submitting' ? 'Submitting...' : 'Post Comment'}
                </button>
              </div>

              {commentStatus.state === 'success' && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{commentStatus.message}</span>
                </div>
              )}

              {commentStatus.state === 'error' && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{commentStatus.message}</span>
                </div>
              )}
            </form>
          </div>
        </section>
      </article>
    </Layout>
  );
}
