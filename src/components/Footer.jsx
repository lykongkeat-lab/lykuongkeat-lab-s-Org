import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Github, Linkedin, Twitter, Mail, Heart, Shield } from 'lucide-react';
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

  return (
    <footer className="mt-20 border-t border-neutral-200 bg-neutral-50/70 transition-colors dark:border-neutral-800 dark:bg-neutral-950">
      {/* Footer Advertisement Slot */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <AdSlot slot="footer" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 font-mono text-xs font-bold text-white dark:bg-white dark:text-neutral-900">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                {siteTitle}
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {tagline}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {siteSettings?.social_github && (
                <a
                  href={siteSettings.social_github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {siteSettings?.social_linkedin && (
                <a
                  href={siteSettings.social_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {siteSettings?.social_twitter && (
                <a
                  href={siteSettings.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              <Link
                to="/contact"
                className="text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                aria-label="Contact"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <Link to="/" className="transition hover:text-neutral-900 dark:hover:text-white">
                  Articles
                </Link>
              </li>
              <li>
                <Link to="/cv" className="transition hover:text-neutral-900 dark:hover:text-white">
                  Curriculum Vitae (CV)
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition hover:text-neutral-900 dark:hover:text-white">
                  About Me
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-neutral-900 dark:hover:text-white">
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Categories
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="transition hover:text-neutral-900 dark:hover:text-white"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-xs text-neutral-400">No categories yet</li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-200/80 pt-8 text-xs text-neutral-500 dark:border-neutral-800/80 dark:text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteTitle}. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 text-neutral-400 transition hover:text-neutral-700 dark:hover:text-neutral-300"
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
