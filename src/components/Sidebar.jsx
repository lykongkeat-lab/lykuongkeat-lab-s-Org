import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Folder, 
  Tag as TagIcon, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import AdSlot from './AdSlot';
import { 
  getCategories, 
  getTags, 
  getPosts, 
  getSiteSettings, 
  subscribeNewsletter 
} from '../lib/api';

export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);

  // Newsletter form state
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    let mounted = true;

    async function loadSidebarData() {
      try {
        const [cats, tagList, postsRes, settings] = await Promise.all([
          getCategories(),
          getTags(),
          getPosts({ page: 1, limit: 4, status: 'published' }),
          getSiteSettings('general'),
        ]);

        if (mounted) {
          setCategories(cats || []);
          setTags(tagList || []);
          setRecentPosts(postsRes?.data || []);
          if (settings) setSiteSettings(settings);
        }
      } catch (err) {
        console.error('Sidebar data loading error:', err);
      }
    }

    loadSidebarData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setSubStatus({ state: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setSubStatus({ state: 'loading', message: '' });
    try {
      const res = await subscribeNewsletter(email);
      setSubStatus({ state: 'success', message: res?.message || 'Thank you for subscribing!' });
      setEmail('');
    } catch (err) {
      setSubStatus({
        state: 'error',
        message: err.message || 'Subscription failed. Please try again.',
      });
    }
  };

  const authorName = siteSettings?.author_name || 'Ly Kuongkeat';
  const authorTitle = siteSettings?.author_title || 'Software Engineer';
  const authorBio =
    siteSettings?.author_bio ||
    'Writing about real-world web development, systems design, and engineering problem solving.';
  const authorAvatar =
    siteSettings?.author_avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  return (
    <aside className="w-full space-y-8">
      {/* 1. Author Profile Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs transition-colors dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full ring-4 ring-neutral-100 dark:ring-neutral-800">
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            {authorName}
          </h3>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {authorTitle}
          </p>

          <p className="mb-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {authorBio}
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {siteSettings?.social_github && (
              <a
                href={siteSettings.social_github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-neutral-100 p-2.5 text-neutral-700 transition hover:bg-neutral-900 hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-900"
                aria-label="GitHub Profile"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {siteSettings?.social_linkedin && (
              <a
                href={siteSettings.social_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-neutral-100 p-2.5 text-neutral-700 transition hover:bg-blue-600 hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-blue-600 dark:hover:text-white"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {siteSettings?.social_twitter && (
              <a
                href={siteSettings.social_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-neutral-100 p-2.5 text-neutral-700 transition hover:bg-sky-500 hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-sky-500 dark:hover:text-white"
                aria-label="Twitter Profile"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            <Link
              to="/contact"
              className="rounded-full bg-neutral-100 p-2.5 text-neutral-700 transition hover:bg-emerald-600 hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-emerald-600 dark:hover:text-white"
              aria-label="Contact Message"
            >
              <Mail className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 w-full pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
            <Link
              to="/cv"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              View Full CV &amp; Experience
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Advertisement Slot: sidebar_top */}
      <AdSlot slot="sidebar_top" />

      {/* 3. Newsletter Subscription */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="mb-2 flex items-center gap-2 text-neutral-900 dark:text-white">
          <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold">Tech Newsletter</h3>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          Get notified whenever I publish a new article about web development or real production solutions. No spam, ever.
        </p>

        <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            required
            className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
          />
          <button
            type="submit"
            disabled={subStatus.state === 'loading'}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {subStatus.state === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {subStatus.state === 'success' && (
          <div className="mt-3 flex items-start gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{subStatus.message}</span>
          </div>
        )}

        {subStatus.state === 'error' && (
          <div className="mt-3 flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{subStatus.message}</span>
          </div>
        )}
      </div>

      {/* 4. Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Recent Articles
          </h3>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/post/${post.slug}`}
                className="group block space-y-1"
              >
                <h4 className="text-sm font-semibold text-neutral-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400 line-clamp-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recent'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {post.reading_time || 3} min
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 5. Categories */}
      {categories.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 flex items-center gap-2">
            <Folder className="h-4 w-4 text-neutral-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Categories
            </h3>
          </div>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <span>{cat.name}</span>
                  <ArrowRight className="h-3 w-3 opacity-40" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Tags Cloud */}
      {tags.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-3 flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-neutral-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Tags
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tag/${tag.slug}`}
                className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 7. Advertisement Slot: sidebar_bottom */}
      <AdSlot slot="sidebar_bottom" />
    </aside>
  );
}
