import React, { useState, useEffect } from 'react';
import { Users, Trash2, Search, Mail, Copy, Check } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getSubscribers, deleteSubscriber } from '../../lib/api';

export default function SubscribersAdmin() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadSubscribers() {
      try {
        const data = await getSubscribers();
        if (mounted) {
          setSubscribers(data || []);
        }
      } catch (err) {
        console.error('Error loading subscribers:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSubscribers();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteSubscriber = async (sub) => {
    if (!window.confirm(`Remove ${sub.email} from newsletter subscribers?`)) return;
    try {
      await deleteSubscriber(sub.id);
      setSubscribers((prev) => prev.filter((s) => s.id !== sub.id));
    } catch (err) {
      alert('Error deleting subscriber: ' + err.message);
    }
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    (sub.email || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleCopyEmails = async () => {
    const emails = filteredSubscribers.map((s) => s.email).join(', ');
    if (!emails) return;
    try {
      await navigator.clipboard.writeText(emails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <AdminLayout
      title="Newsletter Subscribers"
      subtitle="Manage your blog's email newsletter audience and subscriber list."
    >
      <div className="space-y-6">
        {/* Top Bar: Search & Copy Emails */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscriber by email..."
              className="w-full rounded-xl border border-neutral-300 bg-white py-2 pl-10 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {filteredSubscribers.length}{' '}
              {filteredSubscribers.length === 1 ? 'subscriber' : 'subscribers'}
            </span>

            {filteredSubscribers.length > 0 && (
              <button
                type="button"
                onClick={handleCopyEmails}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Copied Emails!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy All Emails
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Subscribers Table Card */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-600" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Newsletter Subscribers ({subscribers.length})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-300">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80">
                <tr>
                  <th scope="col" className="px-4 py-3">Subscriber Email</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Date Subscribed</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-10 text-center text-neutral-400">
                      Loading subscribers...
                    </td>
                  </tr>
                ) : filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-10 text-center text-neutral-400">
                      {searchQuery
                        ? 'No subscribers match your search.'
                        : 'No subscribers yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40"
                    >
                      <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                          <span>{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {sub.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-neutral-500">
                        {sub.created_at
                          ? new Date(sub.created_at).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(sub)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Remove subscriber"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
