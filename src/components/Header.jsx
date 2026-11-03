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
      return 'light';
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
    <header className="sticky top-0 z-40 w-full border-b border-[#16306b] bg-[#061946]/95 text-white shadow-md backdrop-blur-md transition-colors dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2bb8d6] to-[#3cd0a8] font-mono text-sm font-bold text-[#061946] shadow-sm transition-transform group-hover:scale-105">
              <Terminal className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-[#3cd0a8] transition-colors sm:text-xl">
                {siteTitle}
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/15 text-[#3cd0a8] shadow-2xs'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Search Trigger with warm amber glow */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-xl border border-amber-400/25 bg-[#2a2723] p-2.5 text-[#f6c453] shadow-[0_0_16px_rgba(245,158,11,0.25)] transition-all hover:border-amber-400/50 hover:bg-[#353028] hover:text-amber-300"
            aria-label="Search articles"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Theme Switcher with warm amber icon */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-amber-400/20 bg-[#232429] p-2.5 text-[#f6c453] shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all hover:border-amber-400/40 hover:bg-[#2e2f36] hover:text-amber-300"
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-[#f6c453]" />
            ) : (
              <Moon className="h-4 w-4 text-[#f6c453]" />
            )}
          </button>

          {/* Admin Pill Button with Blue-to-Emerald Gradient */}
          {isAdmin ? (
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1d63ed] via-[#1595d6] to-[#2eb886] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          ) : (
            <Link
              to={user ? '/admin' : '/admin/login'}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1d63ed] via-[#1595d6] to-[#2eb886] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Slide-down Search Bar */}
      {searchOpen && (
        <div className="border-t border-[#16306b] bg-[#041236] px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/95">
          <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-3xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f6c453]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, keywords..."
                autoFocus
                className="w-full rounded-xl border border-[#1a3880] bg-[#0b235e] py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-[#2bb8d6] focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#1d63ed] to-[#2eb886] px-4 py-2 text-sm font-bold text-white transition-all hover:brightness-110"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#16306b] bg-[#061946] px-4 pt-3 pb-5 space-y-2 dark:border-neutral-800 dark:bg-neutral-950">
          {navLinks.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-semibold ${
                  isActive
                    ? 'bg-white/15 text-[#3cd0a8]'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 text-[#2bb8d6]" />
                {item.label}
              </Link>
            );
          })}

          <Link
            to={isAdmin || user ? '/admin' : '/admin/login'}
            className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#1d63ed] via-[#1595d6] to-[#2eb886] px-3 py-2.5 text-base font-bold text-white"
          >
            <ShieldCheck className="h-5 w-5" />
            Admin Portal
          </Link>
        </div>
      )}
    </header>
  );
}
