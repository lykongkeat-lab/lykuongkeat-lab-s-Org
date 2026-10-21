import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  FileText, 
  BookOpen, 
  User, 
  Mail, 
  Terminal 
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getSiteSettings } from '../lib/api';

export default function Header() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [siteSettings, setSiteSettings] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Apply data-theme attribute on <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load site settings (title, tagline)
  useEffect(() => {
    let mounted = true;
    getSiteSettings('general').then((data) => {
      if (mounted && data) {
        setSiteSettings(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Articles', path: '/', icon: BookOpen },
    { label: 'CV', path: '/cv', icon: FileText },
    { label: 'About', path: '/about', icon: User },
    { label: 'Contact', path: '/contact', icon: Mail },
  ];

  const siteTitle = siteSettings?.site_title || 'Ly Kuongkeat';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/85 backdrop-blur-md transition-colors dark:border-neutral-800/80 dark:bg-neutral-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 font-mono text-sm font-bold text-white shadow-xs transition-transform group-hover:scale-105 dark:bg-white dark:text-neutral-900">
              <Terminal className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white sm:text-lg">
                {siteTitle}
              </span>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Software Engineer &amp; Blog
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="Search articles"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-neutral-700" />
            )}
          </button>

          {/* Admin Dashboard Quick Link if logged in */}
          {isAdmin ? (
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          ) : user ? (
            <Link
              to="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            >
              Dashboard
            </Link>
          ) : null}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Slide-down Search Bar */}
      {searchOpen && (
        <div className="border-t border-neutral-200 bg-white/95 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/95">
          <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-3xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, keywords..."
                autoFocus
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="rounded-lg p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-2 dark:border-neutral-800 dark:bg-neutral-950">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              <item.icon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
              {item.label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-base font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            >
              <ShieldCheck className="h-5 w-5" />
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
