import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Tag as TagIcon, Clock, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { getTagBySlug, getPosts } from '../lib/api';

export default function TagPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [tag, setTag] = useState(null);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 8;

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function loadTagPosts() {
      try {
        const tagData = await getTagBySlug(slug);
        if (mounted && tagData) {
          setTag(tagData);
        }

        const res = await getPosts({
          tagSlug: slug,
          page: pageParam,
          limit,
          status: 'published',
        });

        if (mounted) {
          setPosts(res.data || []);
          setTotalPages(res.totalPages || 1);
          setTotalCount(res.count || 0);
        }
      } catch (err) {
        console.error('Error loading tag posts:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTagPosts();

    return () => {
      mounted = false;
    };
  }, [slug, pageParam]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to all articles
          </Link>

          <div className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <TagIcon className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Tag</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              #{tag?.name || slug}
            </h1>
            <p className="mt-2 text-xs font-medium text-neutral-400">
              {totalCount} {totalCount === 1 ? 'article tagged' : 'articles tagged'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
            <p className="text-neutral-500 dark:text-neutral-400">
              No articles found with this tag yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-300 hover:shadow-xs dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {post.cover_url && (
                    <div className="h-32 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Draft'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.reading_time || 3} min
                      </span>
                    </div>

                    <Link to={`/post/${post.slug}`}>
                      <h2 className="text-xl font-bold text-neutral-900 transition group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-sm text-neutral-600 line-clamp-2 dark:text-neutral-400">
                      {post.excerpt || 'Read more...'}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <button
              onClick={() => handlePageChange(pageParam - 1)}
              disabled={pageParam <= 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {pageParam} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pageParam + 1)}
              disabled={pageParam >= totalPages}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
