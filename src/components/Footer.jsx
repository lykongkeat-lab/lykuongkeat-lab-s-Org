import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Github, Send, Facebook, Twitter, Mail, Shield } from 'lucide-react';
import AdSlot from './AdSlot';
import { useLanguage } from '../lib/LanguageContext';
import { getSiteSettings, getCategories } from '../lib/api';

function TikTokIcon({ className = 'h-5 w-5' }) {
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

export default function Footer() {
  const [siteSettings, setSiteSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    Promise.all([getSiteSettings('general'), getCategories()]).then(
      ([settings, cats]) => {
        if (mounted) {
          if (settings) setSiteSettings(settings);
          if (cats) setCategories((cats || []).slice(0, 5));
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const siteTitle = siteSettings?.site_title || 'Ly Kuongkeat';
  const tagline =
    siteSettings?.tagline ||
    'Software Engineer & Web Developer — writing about real-world code and engineering.';

  const telegramUrl = siteSettings?.social_telegram || siteSettings?.social_linkedin;
  const facebookUrl = siteSettings?.social_facebook;
  const twitterUrl = siteSettings?.social_twitter;
  const tiktokUrl = siteSettings?.social_tiktok;

  return (
    <footer className="mt-20 border-t border-[#16306b] bg-[#041236] text-slate-300 transition-colors dark:border-neutral-800 dark:bg-neutral-950">
      {/* Footer Advertisement Slot */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <AdSlot slot="footer" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2bb8d6] to-[#3cd0a8] font-mono text-xs font-bold text-[#061946]">
                <Terminal className="h-4 w-4 stroke-[2.5]" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                {siteTitle}
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-slate-300">
              {tagline}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {siteSettings?.social_github && (
                <a
                  href={siteSettings.social_github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 transition hover:text-[#3cd0a8]"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 transition hover:text-[#3cd0a8]"
                  aria-label="Telegram"
                  title="Telegram"
                >
                  <Send className="h-5 w-5" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 transition hover:text-[#3cd0a8]"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 transition hover:text-[#3cd0a8]"
                  aria-label="Twitter / X"
                  title="Twitter / X"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 transition hover:text-[#3cd0a8]"
                  aria-label="TikTok"
                  title="TikTok"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              )}
              <Link
                to="/contact"
                className="text-slate-300 transition hover:text-[#3cd0a8]"
                aria-label="Contact"
                title="Contact"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('footer_navigation')}
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link to="/" className="transition hover:text-[#3cd0a8]">
                  {t('nav_articles')}
                </Link>
              </li>
              <li>
                <Link to="/cv" className="transition hover:text-[#3cd0a8]">
                  {t('footer_cv')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition hover:text-[#3cd0a8]">
                  {t('footer_about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-[#3cd0a8]">
                  {t('footer_contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('sidebar_categories')}
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="transition hover:text-[#3cd0a8]"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-xs text-slate-400">{t('footer_no_categories')}</li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-300 sm:flex-row">
          <p>
            © <span className="font-mono tabular-nums">{new Date().getFullYear()}</span>{' '}
            <span className="font-semibold text-white">{siteTitle}</span>. {t('footer_rights')}
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 font-medium text-[#3cd0a8] transition hover:underline"
            >
              <Shield className="h-3.5 w-3.5" />
              {t('nav_admin_portal')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
