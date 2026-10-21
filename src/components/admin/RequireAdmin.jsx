import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export default function RequireAdmin({ children }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-xs font-medium text-neutral-500">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> send to login page
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Logged in but not marked as is_admin in profiles table
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-100 px-4 py-12 dark:bg-neutral-950">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm dark:border-rose-950 dark:bg-neutral-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Access Denied
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            You are signed in as <span className="font-semibold text-neutral-900 dark:text-white">{user.email}</span>, 
            but this account does not have administrator privileges.
          </p>

          <div className="mt-4 rounded-xl bg-neutral-100 p-3 text-left font-mono text-[11px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            UPDATE public.profiles SET is_admin = TRUE WHERE email = &apos;{user.email}&apos;;
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={() => logout()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <LogOut className="h-3.5 w-3.5" /> Log Out
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Public Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
