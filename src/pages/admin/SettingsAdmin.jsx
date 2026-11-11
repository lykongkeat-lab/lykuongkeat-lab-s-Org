import React, { useState, useEffect, useRef } from 'react';
import { Save, Check, AlertCircle, Upload, Image as ImageIcon, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  getSiteSettings, 
  updateSiteSettings, 
  uploadMediaFile,
  getMediaList
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
    social_telegram: 'https://t.me',
    social_facebook: 'https://facebook.com',
    social_twitter: 'https://x.com',
    social_tiktok: 'https://tiktok.com',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaImages, setMediaImages] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ state: 'idle', message: '' });
  const avatarFileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const settingsData = await getSiteSettings('general');

        if (mounted && settingsData) {
          setSettings({
            ...settingsData,
            social_github: settingsData.social_github ?? 'https://github.com',
            social_telegram:
              settingsData.social_telegram !== undefined
                ? settingsData.social_telegram
                : settingsData.social_linkedin === 'https://linkedin.com'
                ? 'https://t.me'
                : settingsData.social_linkedin || 'https://t.me',
            social_facebook:
              settingsData.social_facebook !== undefined
                ? settingsData.social_facebook
                : 'https://facebook.com',
            social_twitter:
              settingsData.social_twitter !== undefined
                ? settingsData.social_twitter
                : 'https://x.com',
            social_tiktok:
              settingsData.social_tiktok !== undefined
                ? settingsData.social_tiktok
                : 'https://tiktok.com',
          });
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

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setStatusMsg({ state: 'idle', message: '' });

    try {
      const result = await uploadMediaFile(file, `${settings.author_name || 'Author'} Avatar`);
      if (result?.public_url) {
        setSettings((prev) => ({ ...prev, author_avatar: result.public_url }));
        setStatusMsg({
          state: 'success',
          message: 'Avatar image updated! Click "Save Site Settings" to publish changes.',
        });
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      setStatusMsg({
        state: 'error',
        message: err.message || 'Failed to process selected image.',
      });
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleOpenMediaPicker = async () => {
    setShowMediaPicker(true);
    setLoadingMedia(true);
    try {
      const res = await getMediaList({ page: 1, limit: 48 });
      const imgs = (res.data || []).filter((m) => m.mime_type?.startsWith('image/'));
      setMediaImages(imgs);
    } catch (err) {
      console.error('Error loading media library:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleSelectMediaAvatar = (url) => {
    setSettings((prev) => ({ ...prev, author_avatar: url }));
    setShowMediaPicker(false);
    setStatusMsg({
      state: 'success',
      message: 'Avatar image selected! Click "Save Site Settings" to publish changes.',
    });
  };

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

  return (
    <AdminLayout
      title="Site Settings"
      subtitle="Customize global website branding, profile metadata, CV links, and social profiles."
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Author Avatar Image URL
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0d47e1] px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs transition hover:bg-blue-700 disabled:opacity-60 dark:bg-[#05dcef] dark:text-neutral-950 dark:hover:bg-cyan-300"
                    >
                      <Upload className="h-3 w-3" />
                      {uploadingAvatar ? 'Uploading...' : 'Choose Image'}
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenMediaPicker}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <ImageIcon className="h-3 w-3" />
                      Library
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                    {settings.author_avatar ? (
                      <img
                        src={settings.author_avatar}
                        alt="Avatar Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-400">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.author_avatar || ''}
                    placeholder="https://... or choose an image"
                    onChange={(e) => setSettings({ ...settings, author_avatar: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={settings.social_github || ''}
                  placeholder="https://github.com/username"
                  onChange={(e) => setSettings({ ...settings, social_github: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Telegram Profile URL
                </label>
                <input
                  type="url"
                  value={settings.social_telegram || ''}
                  placeholder="https://t.me/username"
                  onChange={(e) => setSettings({ ...settings, social_telegram: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Facebook Profile URL
                </label>
                <input
                  type="url"
                  value={settings.social_facebook || ''}
                  placeholder="https://facebook.com/username"
                  onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
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
                  placeholder="https://x.com/username"
                  onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  TikTok Profile URL
                </label>
                <input
                  type="url"
                  value={settings.social_tiktok || ''}
                  placeholder="https://tiktok.com/@username"
                  onChange={(e) => setSettings({ ...settings, social_tiktok: e.target.value })}
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

        {/* Media Library Image Picker Modal */}
        {showMediaPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Choose Avatar from Media Library
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Select an uploaded image or upload a new photo from your device.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loadingMedia ? (
                  <div className="py-12 text-center text-xs text-neutral-400">
                    Loading media images...
                  </div>
                ) : mediaImages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
                    <ImageIcon className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      No images found in Media Library.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMediaPicker(false);
                        avatarFileInputRef.current?.click();
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#0d47e1] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 dark:bg-[#05dcef] dark:text-neutral-950"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload Image from Computer
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {mediaImages.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => handleSelectMediaAvatar(img.public_url)}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 transition hover:border-[#0d47e1] hover:ring-2 hover:ring-[#0d47e1]/30 dark:border-neutral-800 dark:bg-neutral-800 dark:hover:border-[#05dcef]"
                      >
                        <img
                          src={img.public_url}
                          alt={img.alt_text || img.file_name}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900/60">
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaPicker(false);
                    avatarFileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d47e1] hover:underline dark:text-[#05dcef]"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload new image from computer
                </button>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(false)}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

