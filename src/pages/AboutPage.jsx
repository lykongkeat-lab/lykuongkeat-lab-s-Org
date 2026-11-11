import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github, Send, Facebook, Twitter, ArrowRight, Code, Server, Cpu } from 'lucide-react';
import Layout from '../components/Layout';
import { useLanguage } from '../lib/LanguageContext';
import { getSiteSettings } from '../lib/api';

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

export default function AboutPage() {
  const [settings, setSettings] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    getSiteSettings('general').then((data) => {
      if (mounted && data) setSettings(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const authorName = settings?.author_name || 'Ly Kuongkeat';
  const authorTitle = settings?.author_title || 'Software Engineer';
  const authorBio =
    settings?.author_bio ||
    'I write articles about web development, coding architectures, and real problems encountered in production software development.';
  const authorAvatar =
    settings?.author_avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  const aboutP1 = settings?.about_p1 || t('about_p1');
  const aboutP2 = settings?.about_p2 || t('about_p2');
  const pillar1Title = settings?.pillar_1_title || t('pillar_1_title');
  const pillar1Desc = settings?.pillar_1_desc || t('pillar_1_desc');
  const pillar2Title = settings?.pillar_2_title || t('pillar_2_title');
  const pillar2Desc = settings?.pillar_2_desc || t('pillar_2_desc');
  const pillar3Title = settings?.pillar_3_title || t('pillar_3_title');
  const pillar3Desc = settings?.pillar_3_desc || t('pillar_3_desc');
  const ctaTitle = settings?.about_cta_title || t('about_cta_title');
  const ctaDesc = settings?.about_cta_desc || t('about_cta_desc');

  const telegramUrl = settings?.social_telegram || settings?.social_linkedin;
  const facebookUrl = settings?.social_facebook;
  const twitterUrl = settings?.social_twitter;
  const tiktokUrl = settings?.social_tiktok;

  return (
    <Layout>
      <div className="space-y-10">
        {/* Intro Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl ring-4 ring-[#2bb8d6] dark:ring-neutral-800">
              <img
                src={authorAvatar}
                alt={authorName}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111318] dark:text-white">
                {t('about_prefix')} <span className="text-[#0d47e1] dark:text-[#05dcef]">{authorName}</span>
              </h1>
              <p className="inline-block rounded-full bg-[#efe4c8] px-3.5 py-0.5 text-sm font-semibold text-[#6b4c1b] dark:bg-[#05dcef]/15 dark:text-[#05dcef]">
                {authorTitle}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                {settings?.social_github && (
                  <a
                    href={settings.social_github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4a5162] hover:text-[#0d47e1] dark:text-neutral-400 dark:hover:text-white"
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
                    className="text-[#4a5162] hover:text-[#0088cc] dark:text-neutral-400 dark:hover:text-sky-400"
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
                    className="text-[#4a5162] hover:text-[#1877f2] dark:text-neutral-400 dark:hover:text-blue-500"
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
                    className="text-[#4a5162] hover:text-[#1da1f2] dark:text-neutral-400 dark:hover:text-sky-400"
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
                    className="text-[#4a5162] hover:text-[#111318] dark:text-neutral-400 dark:hover:text-white"
                    aria-label="TikTok Profile"
                    title="TikTok"
                  >
                    <TikTokIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-[#1d4ed8] via-[#10b981] to-[#d9822b]" />

          <div className="prose prose-slate prose-lg dark:prose-invert max-w-none leading-relaxed text-[#2c313c] dark:text-neutral-300 space-y-4">
            {authorBio && <p className="whitespace-pre-line">{authorBio}</p>}
            {aboutP1 && <p className="whitespace-pre-line">{aboutP1}</p>}
            {aboutP2 && <p className="whitespace-pre-line">{aboutP2}</p>}
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-6 border-t border-[#e2e5ec] dark:border-neutral-800">
          <div className="rounded-2xl border border-[#e2e5ec] bg-[#ffffff] p-5 dark:border-neutral-800 dark:bg-neutral-900/40 space-y-2">
            <div className="inline-flex rounded-lg bg-[#efe4c8] p-2 text-[#6b4c1b] dark:bg-neutral-800 dark:text-[#05dcef]">
              <Code className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#111318] dark:text-white">{pillar1Title}</h3>
            <p className="text-xs text-[#4a5162] dark:text-neutral-400 whitespace-pre-line">
              {pillar1Desc}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e2e5ec] bg-[#ffffff] p-5 dark:border-neutral-800 dark:bg-neutral-900/40 space-y-2">
            <div className="inline-flex rounded-lg bg-[#efe4c8] p-2 text-[#6b4c1b] dark:bg-neutral-800 dark:text-[#05dcef]">
              <Server className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#111318] dark:text-white">{pillar2Title}</h3>
            <p className="text-xs text-[#4a5162] dark:text-neutral-400 whitespace-pre-line">
              {pillar2Desc}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e2e5ec] bg-[#ffffff] p-5 dark:border-neutral-800 dark:bg-neutral-900/40 space-y-2">
            <div className="inline-flex rounded-lg bg-[#efe4c8] p-2 text-[#6b4c1b] dark:bg-neutral-800 dark:text-[#05dcef]">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#111318] dark:text-white">{pillar3Title}</h3>
            <p className="text-xs text-[#4a5162] dark:text-neutral-400 whitespace-pre-line">
              {pillar3Desc}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-[#e2e5ec] bg-[#ffffff] p-8 text-[#111318] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-[#111318] dark:text-white">{ctaTitle}</h3>
            <p className="text-xs font-medium text-[#4a5162] dark:text-neutral-400">
              {ctaDesc}
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1d63ed] via-[#1595d6] to-[#2eb886] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
          >
            {t('get_in_touch')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
