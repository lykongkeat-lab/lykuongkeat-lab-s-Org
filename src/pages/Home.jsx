import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Eye, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import { getPosts } from '../lib/api';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState(null);

  const limit = 8;

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function loadData() {
      try {
        const res = await getPosts({
          page: pageParam,
          limit,
          status: 'published',
        });

        if (mounted) {
          setPosts(res.data || []);
          setTotalPages(res.totalPages || 1);
          setTotalCount(res.count || 0);

          // Find a featured post for the top banner on page 1
          if (pageParam === 1 && res.data && res.data.length > 0) {
            const featured = res.data.find((p) => p.is_featured) || res.data[0];
            setFeaturedPost(featured);
          } else {
            setFeaturedPost(null);
          }
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [pageParam]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filter out featured post from regular feed only if it is displayed on page 1
  const displayPosts =
    pageParam === 1 && featuredPost
      ? posts.filter((p) => p.id !== featuredPost.id)
      : posts;

  return (
    <Layout>
      <div className="space-y-10">
        
        {/* Welcome Section matching screenshot */}
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#efe4c8] px-3.5 py-1.5 text-xs font-semibold text-[#6b4c1b] shadow-2xs dark:bg-amber-950/60 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-[#7c581f] dark:text-amber-400" />
            Engineering &amp; Web Development
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-[1.15]">
            <span className="block text-[#111318] dark:text-white">
              Writing about code, architecture,
            </span>
            <span className="block text-[#0d47e1] dark:text-[#38bdf8]">
              and real-world problems
            </span>
          </h1>

          <p className="pt-1 text-base sm:text-lg leading-relaxed text-[#2c313c] dark:text-neutral-400">
            Explore hands-on technical tutorials, production post-mortems, and frontend/backend deeps.
          </p>

          {/* Blue -> Teal -> Orange Gradient Divider Line */}
          <div className="pt-4">
            <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-[#1d4ed8] via-[#10b981] to-[#d9822b]" />
          </div>
        </div>

        {/* Featured Post Card (Page 1) */}
        {pageParam === 1 && featuredPost && !loading && (
          <div className="relative overflow-hidden rounded-2xl border border-[#e2e5ec] bg-[#f8f9fa] p-6 sm:p-8 shadow-xs transition-all hover:border-[#cfd5e2] dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              {featuredPost.cover_url && (
                <div className="lg:col-span-5 overflow-hidden rounded-xl">
                  <img
                    src={featuredPost.cover_url}
                    alt={featuredPost.title}
                    className="h-56 w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <div className={`${featuredPost.cover_url ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-gradient-to-r from-[#1d63ed] to-[#2eb886] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                    Featured
                  </span>
                  {featuredPost.categories?.name && (
                    <span className="rounded-md bg-[#efe4c8] px-2.5 py-0.5 text-xs font-semibold text-[#6b4c1b] dark:bg-neutral-800 dark:text-neutral-300">
                      {featuredPost.categories.name}
                    </span>
                  )}
                </div>

                <Link to={`/post/${featuredPost.slug}`}>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#111318] transition hover:text-[#0d47e1] dark:text-white dark:hover:text-[#38bdf8]">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-sm leading-relaxed text-[#2c313c] line-clamp-3 dark:text-neutral-300">
                  {featuredPost.excerpt || 'Read the full article for in-depth insights and practical implementations.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-2 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#0d47e1] dark:text-neutral-400" />
                    {featuredPost.published_at
                      ? new Date(featuredPost.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recently published'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#10b981]" />
                    {featuredPost.reading_time || 3} min read
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-[#d9822b]" />
                    {featuredPost.views || 0} views
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/post/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1d63ed] via-[#1595d6] to-[#2eb886] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:brightness-110"
                  >
                    Read article <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#111318] dark:text-white">
              Latest Articles {totalCount > 0 && <span className="text-xs font-semibold text-slate-500">({totalCount})</span>}
            </h2>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-[#e2e5ec] bg-[#f8f9fa] p-6 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-neutral-800 rounded mb-3" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-neutral-800 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-neutral-800 rounded" />
                </div>
              ))}
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="rounded-2xl border border-[#e2e5ec] bg-[#f7f8fa] p-12 text-center shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="text-lg font-bold text-[#111318] dark:text-white">
                No articles published yet
              </h3>
              <p className="mt-2 text-sm text-[#2c313c] dark:text-neutral-400">
                Check back soon or sign in to the{' '}
                <Link
                  to="/admin"
                  className="inline-block rounded-md bg-gradient-to-r from-[#4f9cf9] via-[#5fd3bc] to-[#e69d45] px-2 py-0.5 font-semibold text-[#111318] transition hover:brightness-105"
                >
                  Admin Dashboard
                </Link>{' '}
                to write the first post.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayPosts.map((post) => (
                <article
                  key={post.id}
                  className="group rounded-2xl border border-[#e2e5ec] bg-[#f8f9fa] p-6 transition-all hover:border-[#1d63ed]/40 hover:bg-white hover:shadow-xs dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {post.cover_url && (
                      <div className="h-40 w-full sm:h-32 sm:w-48 shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-neutral-800">
                        <img
                          src={post.cover_url}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {post.categories?.name && (
                          <Link
                            to={`/category/${post.categories.slug}`}
                            className="rounded-md bg-[#efe4c8] px-2.5 py-0.5 text-xs font-semibold text-[#6b4c1b] hover:bg-[#e5d5b0] transition dark:bg-neutral-800 dark:text-neutral-300"
                          >
                            {post.categories.name}
                          </Link>
                        )}
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Draft'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="flex items-center gap-1 text-xs font-medium text-[#0d47e1] dark:text-neutral-400">
                          <Clock className="h-3 w-3" />
                          {post.reading_time || 3} min
                        </span>
                      </div>

                      <Link to={`/post/${post.slug}`} className="block">
                        <h3 className="text-lg font-bold text-[#111318] transition group-hover:text-[#0d47e1] dark:text-white dark:group-hover:text-[#38bdf8] sm:text-xl">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-sm leading-relaxed text-[#2c313c] dark:text-neutral-400 line-clamp-2">
                        {post.excerpt || 'Click to read full article...'}
                      </p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {post.tags.map((t) => (
                            <Link
                              key={t.id}
                              to={`/tag/${t.slug}`}
                              className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#1595d6] hover:text-[#0d47e1] dark:text-neutral-400 dark:hover:text-[#38bdf8]"
                            >
                              #{t.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#e2e5ec] pt-6 dark:border-neutral-800">
            <button
              onClick={() => handlePageChange(pageParam - 1)}
              disabled={pageParam <= 1}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#d5dae5] bg-white px-4 py-2 text-sm font-semibold text-[#111318] transition hover:bg-slate-100 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            <span className="text-sm text-[#2c313c] dark:text-neutral-400">
              Page <span className="font-bold text-[#0d47e1] dark:text-white">{pageParam}</span> of{' '}
              <span className="font-bold text-[#0d47e1] dark:text-white">{totalPages}</span>
            </span>

            <button
              onClick={() => handlePageChange(pageParam + 1)}
              disabled={pageParam >= totalPages}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#d5dae5] bg-white px-4 py-2 text-sm font-semibold text-[#111318] transition hover:bg-slate-100 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>
    </Layout>
  );
}
