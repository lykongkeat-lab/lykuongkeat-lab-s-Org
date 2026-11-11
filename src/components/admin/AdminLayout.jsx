import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  FolderTree, 
  MessageSquare, 
  Megaphone, 
  Image, 
  UserCheck, 
  Settings, 
  Mail, 
  LogOut, 
  Globe, 
  Menu, 
  X, 
  Languages
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { useTheme } from '../../lib/ThemeContext';

export default function AdminLayout({ children, title, subtitle }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useTheme();

  const { user, profile, logout } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'All Posts', path: '/admin/posts', icon: FileText },
    { label: 'New Post', path: '/admin/posts/new', icon: PlusCircle },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Comments', path: '/admin/comments', icon: MessageSquare },
    { label: 'Advertisements', path: '/admin/ads', icon: Megaphone },
    { label: 'Media Library', path: '/admin/media', icon: Image },
    { label: 'CV Editor', path: '/admin/cv', icon: UserCheck },
    { label: 'About Editor', path: '/admin/about', icon: UserCheck },
    { label: 'Messages', path: '/admin/messages', icon: Mail },
    { label: 'Site Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#ffffff] text-[#111318] transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[#e2e5ec] bg-[#ffffff] dark:border-neutral-800 dark:bg-neutral-900 shrink-0">
        <div className="flex h-16 items-center justify-between bg-[#061946] px-6">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2bb8d6] to-[#3cd0a8] font-mono text-sm font-black text-[#061946]">
              &gt;_
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1d63ed] via-[#1595d6] to-[#2eb886] text-white shadow-sm'
                    : 'text-[#3f4654] hover:bg-slate-50 hover:text-[#0d47e1] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile and Links */}
        <div className="border-t border-[#e2e5ec] p-4 dark:border-neutral-800 space-y-3">
          <Link
            to="/"
            onClick={() => sessionStorage.removeItem('last_spa_route')}
            className="flex items-center justify-between rounded-xl border border-[#e2e5ec] bg-[#ffffff] px-3 py-2 text-xs font-bold text-[#0d47e1] transition hover:bg-[#0d47e1] hover:text-white dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" />
              View Live Website
            </span>
            <span className="text-[10px]">↗</span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2bb8d6] to-[#3cd0a8] text-xs font-bold text-[#061946]">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="truncate text-left">
                <p className="truncate text-xs font-bold text-[#111318] dark:text-white">
                  {profile?.full_name || 'Admin'}
                </p>
                <p className="truncate text-[10px] font-medium text-[#5a6275] dark:text-neutral-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-neutral-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e2e5ec] bg-[#ffffff]/95 px-4 sm:px-6 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-[#0d47e1] dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#111318] dark:text-white">
                {title || 'Dashboard'}
              </h1>
              {subtitle && (
                <p className="hidden sm:block text-xs font-medium text-[#5a6275] dark:text-neutral-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* One-Click Bilingual Switcher */}
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e5ec] bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#111318] transition hover:border-[#0d47e1] hover:text-[#0d47e1] dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              title={lang === 'en' ? 'ប្តូរទៅភាសាខ្មែរ (Switch to Khmer)' : 'Switch to English'}
            >
              <Languages className="h-3.5 w-3.5 text-[#0d47e1] dark:text-[#3cd0a8]" />
              <span>{lang === 'en' ? 'ភាសាខ្មែរ' : 'English'}</span>
            </button>

            <Link
              to="/admin/posts/new"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1d63ed] via-[#1595d6] to-[#2eb886] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              New Article
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-b border-[#e2e5ec] bg-[#ffffff] p-4 dark:border-neutral-800 dark:bg-neutral-900 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#111318] hover:bg-slate-50 hover:text-[#0d47e1] dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <item.icon className="h-4 w-4 text-[#0d47e1]" />
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#e2e5ec] dark:border-neutral-800 flex items-center justify-between">
              <Link
                to="/"
                target="_blank"
                className="text-xs font-bold text-[#0d47e1] dark:text-[#05dcef]"
              >
                Live Website ↗
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
