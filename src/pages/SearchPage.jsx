import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Clock, Calendar, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { getPosts } from '../lib/api';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [inputVal, setInputVal] = useState(initialQuery);
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const limit = 8;

  useEffect(() => {
    setInputVal(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    let mounted = true;

    if (!initialQuery.trim()) {
      setPosts([]);
      setTotalCount(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);

    async function executeSearch() {
      try {
        const res = await getPosts({
          search: initialQuery.trim(),
          page: pageParam,
          limit,
          status: 'published',
        });

        if (mounted) {
          setPosts(res.data || []);
          setTotalCount(res.count || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    executeSearch();

    return () => {
      mounted = false;
    };
  }, [initialQuery, pageParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim(), page: '1' });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ q: initialQuery, page: newPage.toString() });
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

          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-6">
            Search Articles
          </h1>

          {/* Search Form Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search by article title or keywords..."
                className="w-full rounded-xl border border-neutral-300 bg-white py-3 pl-11 pr-4 text-base text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Search
            </button>
          </form>

          {initialQuery && (
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              Found <span className="font-semibold text-neutral-900 dark:text-white">{totalCount}</span> results for &ldquo;{initialQuery}&rdquo;
            </p>
          )}
        </div>

        {/* Results Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
              />
            ))}
          </div>
        ) : !initialQuery ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
            <Search className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Type keywords above to search for articles.
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              No matching articles found
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Try different keywords or check out categories from the sidebar.
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
                      {post.categories?.name && (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {post.categories.name}
                        </span>
                      )}
                      <span>•</span>
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

        {/* Pagination */}
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
