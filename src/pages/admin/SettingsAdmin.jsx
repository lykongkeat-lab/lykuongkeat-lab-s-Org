import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, AlertCircle, Users, Trash2, Mail } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  getSiteSettings, 
  updateSiteSettings, 
  getSubscribers, 
  deleteSubscriber 
} from '../../lib/api';

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({
    site_title: 'Ly Kuongkeat',
    tagline: 'Software Engineer & Web Developer — writing about real-world code and engineering',
    author_name: 'Ly Kuongkeat',
    author_title: 'Senior Software Engineer',
    author_bio: 'Passionate about full-stack web engineering, resilient architectures, and sharing lessons learned from shipping production systems.',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    cv_pdf_url: '',
    social_github: 'https://github.com',
    social_linkedin: 'https://linkedin.com',
    social_twitter: 'https://twitter.com',
  });

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [settingsData, subsData] = await Promise.all([
          getSiteSettings('general'),
          getSubscribers(),
        ]);

        if (mounted) {
          if (settingsData) setSettings(settingsData);
          setSubscribers(subsData || []);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ state: 'idle', message: '' });

    try {
      await updateSiteSettings('general', settings);
      setStatusMsg({ state: 'success', message: 'Site settings updated successfully!' });
    } catch (err) {
      console.error('Failed to save settings:', err);
      setStatusMsg({ state: 'error', message: err.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubscriber = async (sub) => {
    if (!window.confirm(`Remove ${sub.email} from newsletter subscribers?`)) return;
    try {
      await deleteSubscriber(sub.id);
      setSubscribers((prev) => prev.filter((s) => s.id !== sub.id));
    } catch (err) {
      alert('Error deleting subscriber: ' + err.message);
    }
  };

  return (
    <AdminLayout
      title="Site Settings &amp; Subscribers"
      subtitle="Customize global website branding, profile metadata, CV links, and newsletter audience."
    >
      <div className="space-y-10">
        
        {/* Settings Form */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                General Configuration
              </h3>
              <p className="text-xs text-neutral-500">
                These settings configure your header logo, footer details, and social links.
              </p>
            </div>

            {statusMsg.message && (
              <div className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium ${
                statusMsg.state === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {statusMsg.state === 'success' ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{statusMsg.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Website Title *
                </label>
                <input
                  type="text"
                  required
                  value={settings.site_title || ''}
                  onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Author Professional Title
                </label>
                <input
                  type="text"
                  value={settings.author_title || ''}
                  onChange={(e) => setSettings({ ...settings, author_title: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Site Tagline
              </label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Author Full Name
                </label>
                <input
                  type="text"
                  value={settings.author_name || ''}
                  onChange={(e) => setSettings({ ...settings, author_name: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Author Avatar Image URL
                </label>
                <input
                  type="url"
                  value={settings.author_avatar || ''}
                  onChange={(e) => setSettings({ ...settings, author_avatar: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Author Short Bio
              </label>
              <textarea
                rows={3}
                value={settings.author_bio || ''}
                onChange={(e) => setSettings({ ...settings, author_bio: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                CV PDF Download Link (Cloudflare R2 public link)
              </label>
              <input
                type="url"
                value={settings.cv_pdf_url || ''}
                onChange={(e) => setSettings({ ...settings, cv_pdf_url: e.target.value })}
                placeholder="https://.../my-cv.pdf"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={settings.social_github || ''}
                  onChange={(e) => setSettings({ ...settings, social_github: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={settings.social_linkedin || ''}
                  onChange={(e) => setSettings({ ...settings, social_linkedin: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Twitter / X Profile URL
                </label>
                <input
                  type="url"
                  value={settings.social_twitter || ''}
                  onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Site Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Newsletter Subscribers Table */}
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
                  <th scope="col" className="px-4 py-3">Date Subscribed</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-neutral-400">
                      No subscribers yet.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
                      <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">
                        {sub.email}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(sub)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
