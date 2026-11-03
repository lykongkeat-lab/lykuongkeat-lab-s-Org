import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Github, Send, Facebook, Mail, Shield } from 'lucide-react';
import AdSlot from './AdSlot';
import { getSiteSettings, getCategories } from '../lib/api';

export default function Footer() {
  const [siteSettings, setSiteSettings] = useState(null);
  const [categories, setCategories] = useState([]);

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
  const facebookUrl = siteSettings?.social_facebook || siteSettings?.social_twitter;

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
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link to="/" className="transition hover:text-[#3cd0a8]">
                  Articles
                </Link>
              </li>
              <li>
                <Link to="/cv" className="transition hover:text-[#3cd0a8]">
                  Curriculum Vitae (CV)
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition hover:text-[#3cd0a8]">
                  About Me
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-[#3cd0a8]">
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Categories
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
                <li className="text-xs text-slate-400">No categories yet</li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-300 sm:flex-row">
          <p>© {new Date().getFullYear()} <span className="font-semibold text-white">{siteTitle}</span>. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 font-medium text-[#3cd0a8] transition hover:underline"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
