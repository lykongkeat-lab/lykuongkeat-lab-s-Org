import React, { useState, useEffect } from 'react';
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
  Sun, 
  Moon, 
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export default function AdminLayout({ children, title, subtitle }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || 'light';
    }
    return 'light';
  });

  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

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
    { label: 'Messages', path: '/admin/messages', icon: Mail },
    { label: 'Site Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 shrink-0">
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6 dark:border-neutral-800">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 font-mono text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
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
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile and Links */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              View Live Website
            </span>
            <span className="text-[10px] text-neutral-400">↗</span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="truncate text-left">
                <p className="truncate text-xs font-bold text-neutral-900 dark:text-white">
                  {profile?.full_name || 'Admin'}
                </p>
                <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="rounded-lg p-2 text-neutral-500 hover:bg-rose-50 hover:text-rose-600 dark:text-neutral-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                {title || 'Dashboard'}
              </h1>
              {subtitle && (
                <p className="hidden sm:block text-xs text-neutral-500 dark:text-neutral-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              title="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              to="/admin/posts/new"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              New Article
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-b border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <Link
                to="/"
                target="_blank"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400"
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
