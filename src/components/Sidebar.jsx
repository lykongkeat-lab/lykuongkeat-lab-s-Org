import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Send, 
  Facebook, 
  Twitter, 
  Mail, 
  Folder, 
  Tag as TagIcon, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import AdSlot from './AdSlot';
import { useLanguage } from '../lib/LanguageContext';
import { 
  getCategories, 
  getTags, 
  getPosts, 
  getSiteSettings 
} from '../lib/api';

function TikTokIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const { t } = useLanguage();

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

  const authorName = siteSettings?.author_name || 'Ly Kuongkeat';
  const authorTitle = siteSettings?.author_title || 'Software Engineer';
  const authorBio =
    siteSettings?.author_bio ||
    'Writing about real-world web development, systems design, and engineering problem solving.';
  const authorAvatar =
    siteSettings?.author_avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  const telegramUrl = siteSettings?.social_telegram || siteSettings?.social_linkedin;
  const facebookUrl = siteSettings?.social_facebook;
  const twitterUrl = siteSettings?.social_twitter;
  const tiktokUrl = siteSettings?.social_tiktok;

  return (
    <aside className="w-full space-y-8">
      {/* 1. Author Profile Card */}
      <div className="rounded-2xl border border-[#e2e5ec] bg-[#ffffff] p-6 shadow-2xs transition-colors dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full ring-4 ring-[#2bb8d6]/40 dark:ring-neutral-800">
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <h3 className="text-lg font-bold text-[#111318] dark:text-white">
            {authorName}
          </h3>
          <p className="mt-1 mb-3 rounded-full bg-[#efe4c8] px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-[#6b4c1b] dark:bg-neutral-800 dark:text-[#3cd0a8]">
            {authorTitle}
          </p>

          <p className="mb-5 text-sm leading-relaxed text-[#2c313c] dark:text-neutral-400">
            {authorBio}
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {siteSettings?.social_github && (
              <a
                href={siteSettings.social_github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#ffffff] border border-[#e2e5ec] p-2.5 text-[#111318] transition hover:bg-[#061946] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                aria-label="GitHub Profile"
                title="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#ffffff] border border-[#e2e5ec] p-2.5 text-[#0088cc] transition hover:bg-[#0088cc] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                aria-label="Telegram Profile"
                title="Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#ffffff] border border-[#e2e5ec] p-2.5 text-[#1877f2] transition hover:bg-[#1877f2] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                aria-label="Facebook Profile"
                title="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {twitterUrl && (
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#ffffff] border border-[#e2e5ec] p-2.5 text-[#1da1f2] transition hover:bg-[#1da1f2] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                aria-label="Twitter / X Profile"
                title="Twitter / X"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#ffffff] border border-[#e2e5ec] p-2.5 text-[#111318] transition hover:bg-[#111318] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                aria-label="TikTok Profile"
                title="TikTok"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
            )}
            <Link
              to="/contact"
              className="rounded-full bg-[#ffffff] border border-[#e2e5ec] p-2.5 text-[#2eb886] transition hover:bg-[#2eb886] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              aria-label="Contact Message"
              title="Contact"
            >
              <Mail className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 w-full pt-4 border-t border-[#e2e5ec] dark:border-neutral-800/80">
            <Link
              to="/cv"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1d63ed] via-[#1595d6] to-[#2eb886] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:brightness-110"
            >
              {t('sidebar_view_cv')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Advertisement Slot: sidebar_top */}
      <AdSlot slot="sidebar_top" />

      {/* 4. Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="rounded-2xl border border-[#e2e5ec] bg-[#ffffff] p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#6b4c1b] dark:text-neutral-400">
            {t('sidebar_recent')}
          </h3>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/post/${post.slug}`}
                className="group block space-y-1"
              >
                <h4 className="text-sm font-semibold text-[#111318] transition-colors group-hover:text-[#0d47e1] dark:text-white dark:group-hover:text-[#3cd0a8] line-clamp-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-neutral-400">
                  <span className="font-mono tabular-nums">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : t('recently_published')}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-[#0d47e1] dark:text-neutral-400">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono tabular-nums">{post.reading_time || 3}</span> {t('min_short')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 5. Categories */}
      {categories.length > 0 && (
        <div className="rounded-2xl border border-[#e2e5ec] bg-[#ffffff] p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 flex items-center gap-2">
            <Folder className="h-4 w-4 text-[#0d47e1] dark:text-[#3cd0a8]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111318] dark:text-neutral-400">
              {t('sidebar_categories')}
            </h3>
          </div>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#2c313c] transition hover:bg-slate-50 hover:text-[#0d47e1] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <span>{cat.name}</span>
                  <ArrowRight className="h-3 w-3 text-[#0d47e1] opacity-70" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Tags Cloud */}
      {tags.length > 0 && (
        <div className="rounded-2xl border border-[#e2e5ec] bg-[#ffffff] p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-3 flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-[#0d47e1] dark:text-[#3cd0a8]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111318] dark:text-neutral-400">
              {t('sidebar_tags')}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tag/${tag.slug}`}
                className="rounded-md border border-[#d5dae5] bg-[#ffffff] px-2.5 py-1 text-xs font-semibold text-[#2c313c] transition hover:border-[#0d47e1] hover:text-[#0d47e1] dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400"
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
