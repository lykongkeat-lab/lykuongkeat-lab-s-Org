import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';
import { sendContactMessage } from '../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setStatus({ state: 'error', message: 'Please fill out all fields before submitting.' });
      return;
    }

    setStatus({ state: 'loading', message: '' });

    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setStatus({
        state: 'success',
        message: 'Your message has been sent successfully! I will get back to you as soon as possible.',
      });

      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact form submission error:', err);
      setStatus({
        state: 'error',
        message: err.message || 'Failed to send your message. Please try again later.',
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Mail className="h-3.5 w-3.5" /> Direct Contact
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Get in Touch
          </h1>
          <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
            Have a question about an article, a consulting inquiry, or feedback? Send a message directly using the form below.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Question about web development, consulting, etc."
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Message *
              </label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write your message here..."
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white"
              />
            </div>

            <button
              type="submit"
              disabled={status.state === 'loading'}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Send className="h-4 w-4" />
              {status.state === 'loading' ? 'Sending...' : 'Send Message'}
            </button>

            {status.state === 'success' && (
              <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{status.message}</span>
              </div>
            )}

            {status.state === 'error' && (
              <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{status.message}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
