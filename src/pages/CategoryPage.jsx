import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Folder, Clock, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { getCategoryBySlug, getPosts } from '../lib/api';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 8;

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function loadCategoryPosts() {
      try {
        const catData = await getCategoryBySlug(slug);
        if (mounted && catData) {
          setCategory(catData);
        }

        const res = await getPosts({
          categorySlug: slug,
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
        console.error('Error loading category posts:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCategoryPosts();

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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d47e1] hover:underline dark:text-neutral-400 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to all articles
          </Link>

          <div className="pb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#efe4c8] px-3 py-1 text-[#6b4c1b] dark:bg-[#05dcef]/15 dark:text-[#05dcef] mb-2">
              <Folder className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Category</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111318] dark:text-white sm:text-4xl">
              {category?.name || slug}
            </h1>
            {category?.description && (
              <p className="mt-2 text-base text-[#2c313c] dark:text-neutral-400">
                {category.description}
              </p>
            )}
            <p className="mt-2 text-xs font-bold text-[#0d47e1] dark:text-[#05dcef]">
              {totalCount} {totalCount === 1 ? 'article' : 'articles'} in this category
            </p>
            <div className="mt-5 h-1.5 w-full rounded-full bg-gradient-to-r from-[#1d4ed8] via-[#10b981] to-[#d9822b]" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-[#e2e5ec] bg-[#f8f9fa] dark:border-neutral-800 dark:bg-neutral-900"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-[#e2e5ec] bg-[#f8f9fa] p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-[#2c313c] dark:text-neutral-400 font-medium">
              No articles found in this category yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group rounded-2xl border border-[#e2e5ec] bg-[#f8f9fa] p-6 transition hover:border-[#1d63ed]/50 hover:bg-white hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {post.cover_url && (
                    <div className="h-32 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-neutral-800">
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#5a6275] dark:text-neutral-400">
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
                        <Clock className="h-3 w-3 text-[#0d47e1]" />
                        {post.reading_time || 3} min
                      </span>
                    </div>

                    <Link to={`/post/${post.slug}`}>
                      <h2 className="text-xl font-bold text-[#111318] transition group-hover:text-[#0d47e1] dark:text-white dark:group-hover:text-[#05dcef]">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-sm text-[#4a5162] line-clamp-2 dark:text-neutral-400">
                      {post.excerpt || 'Read more...'}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#e2e5ec] pt-6 dark:border-neutral-800">
            <button
              onClick={() => handlePageChange(pageParam - 1)}
              disabled={pageParam <= 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d5dae2] bg-white px-4 py-2 text-sm font-semibold text-[#111318] transition hover:border-[#0d47e1] hover:text-[#0d47e1] disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm font-semibold text-[#4a5162] dark:text-neutral-400">
              Page {pageParam} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pageParam + 1)}
              disabled={pageParam >= totalPages}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d5dae2] bg-white px-4 py-2 text-sm font-semibold text-[#111318] transition hover:border-[#0d47e1] hover:text-[#0d47e1] disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
