import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Terminal, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/admin';

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, isAdmin, loading, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      // Check admin status on logged in profile
      if (res?.profile && !res.profile.is_admin) {
        setErrorMsg(
          'Login successful, but this account is not registered as an administrator. ' +
          'Please ensure is_admin = true in the public.profiles table.'
        );
      } else {
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-100 px-4 py-12 transition-colors dark:bg-neutral-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 font-mono text-base font-bold text-white shadow-md dark:bg-white dark:text-neutral-900">
              <Terminal className="h-6 w-6" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Admin Portal
          </h2>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Sign in to manage articles, categories, comments, and advertisements.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm transition-colors dark:border-neutral-800 dark:bg-neutral-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {submitting ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-neutral-100 pt-4 text-center dark:border-neutral-800">
            <Link
              to="/"
              className="text-xs text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              ← Back to public website
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
