import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Save,
  Check,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  X,
  ExternalLink,
  Code,
  Server,
  Cpu,
  Globe,
  Terminal,
  Layers,
  Shield,
  Sparkles,
  Plus,
  Trash2,
  User
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getSiteSettings,
  updateSiteSettings,
  uploadMediaFile,
  getMediaList
} from '../../lib/api';

const ICON_OPTIONS = [
  { value: 'code', label: 'Code', Icon: Code },
  { value: 'server', label: 'Server / DB', Icon: Server },
  { value: 'cpu', label: 'CPU / Performance', Icon: Cpu },
  { value: 'terminal', label: 'Terminal', Icon: Terminal },
  { value: 'globe', label: 'Web / Cloud', Icon: Globe },
  { value: 'layers', label: 'Architecture', Icon: Layers },
  { value: 'shield', label: 'Security', Icon: Shield },
  { value: 'sparkles', label: 'AI / Innovation', Icon: Sparkles },
];

const DEFAULT_PILLARS = [
  {
    id: 'pillar-1',
    icon: 'code',
    title: 'Clean Engineering',
    description: 'Writing maintainable, well-tested codebases in React, TypeScript, and Node.js.',
  },
  {
    id: 'pillar-2',
    icon: 'server',
    title: 'Backend & DBs',
    description: 'Designing scalable PostgreSQL schemas, Edge APIs, and distributed storage.',
  },
  {
    id: 'pillar-3',
    icon: 'cpu',
    title: 'Performance',
    description: 'Profiling bottlenecks, optimizing bundle sizes, and reducing latency at the edge.',
  },
];

const DEFAULT_ABOUT_FIELDS = {
  author_name: 'Ly Kuongkeat',
  author_title: 'Senior Software Engineer',
  author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  author_bio:
    'Passionate about full-stack web engineering, resilient architectures, and sharing lessons learned from shipping production systems.',
  about_p1:
    'Welcome to my personal tech blog. Here, I document real challenges, architectural solutions, and coding techniques that come up while designing, building, and maintaining production applications.',
  about_p2:
    'My goal is to share honest reflections, detailed benchmarks, and code recipes that save other developers time and headaches.',
  about_pillars: DEFAULT_PILLARS,
  about_cta_title: 'Have a question or project in mind?',
  about_cta_desc: 'Feel free to reach out for collaborations, technical discussions, or consulting.',
};

function renderPillarIcon(iconName) {
  const match = ICON_OPTIONS.find((opt) => opt.value === iconName);
  const IconComp = match ? match.Icon : Code;
  return <IconComp className="h-4 w-4" />;
}

export default function AboutAdmin() {
  const [settings, setSettings] = useState(DEFAULT_ABOUT_FIELDS);
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
    async function loadAboutSettings() {
      try {
        const data = await getSiteSettings('general');
        if (mounted && data) {
          let resolvedPillars = DEFAULT_PILLARS;
          if (Array.isArray(data.about_pillars) && data.about_pillars.length > 0) {
            resolvedPillars = data.about_pillars;
          } else if (data.pillar_1_title || data.pillar_2_title || data.pillar_3_title) {
            resolvedPillars = [
              {
                id: 'pillar-1',
                icon: 'code',
                title: data.pillar_1_title ?? DEFAULT_PILLARS[0].title,
                description: data.pillar_1_desc ?? DEFAULT_PILLARS[0].description,
              },
              {
                id: 'pillar-2',
                icon: 'server',
                title: data.pillar_2_title ?? DEFAULT_PILLARS[1].title,
                description: data.pillar_2_desc ?? DEFAULT_PILLARS[1].description,
              },
              {
                id: 'pillar-3',
                icon: 'cpu',
                title: data.pillar_3_title ?? DEFAULT_PILLARS[2].title,
                description: data.pillar_3_desc ?? DEFAULT_PILLARS[2].description,
              },
            ];
          }

          setSettings((prev) => ({
            ...prev,
            ...data,
            author_name: data.author_name ?? prev.author_name,
            author_title: data.author_title ?? prev.author_title,
            author_avatar: data.author_avatar ?? prev.author_avatar,
            author_bio: data.author_bio ?? prev.author_bio,
            about_p1: data.about_p1 ?? prev.about_p1,
            about_p2: data.about_p2 ?? prev.about_p2,
            about_pillars: resolvedPillars,
            about_cta_title: data.about_cta_title ?? prev.about_cta_title,
            about_cta_desc: data.about_cta_desc ?? prev.about_cta_desc,
          }));
        }
      } catch (err) {
        console.error('Error loading about settings:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAboutSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddPillarCard = () => {
    const nextIndex = (settings.about_pillars?.length || 0) + 1;
    const defaultIcons = ['code', 'server', 'cpu', 'terminal', 'globe', 'layers', 'shield', 'sparkles'];
    const icon = defaultIcons[(nextIndex - 1) % defaultIcons.length];

    const newCard = {
      id: `pillar-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      icon,
      title: `Highlight Card ${nextIndex}`,
      description: 'Describe your skill, engineering focus, or achievement here.',
    };

    setSettings((prev) => ({
      ...prev,
      about_pillars: [...(prev.about_pillars || []), newCard],
    }));
  };

  const handleUpdatePillarCard = (index, field, value) => {
    setSettings((prev) => {
      const updated = [...(prev.about_pillars || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, about_pillars: updated };
    });
  };

  const handleRemovePillarCard = (index) => {
    setSettings((prev) => {
      const updated = (prev.about_pillars || []).filter((_, i) => i !== index);
      return { ...prev, about_pillars: updated };
    });
  };

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
          message: 'Profile photo updated! Click "Save About Page" to publish changes.',
        });
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      setStatusMsg({
        state: 'error',
        message: err.message || 'Failed to upload image.',
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
      message: 'Profile photo selected! Click "Save About Page" to publish changes.',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ state: 'idle', message: '' });

    try {
      const existing = (await getSiteSettings('general')) || {};
      const pillars = settings.about_pillars || [];
      const merged = {
        ...existing,
        ...settings,
        about_pillars: pillars,
        pillar_1_title: pillars[0]?.title || '',
        pillar_1_desc: pillars[0]?.description || '',
        pillar_2_title: pillars[1]?.title || '',
        pillar_2_desc: pillars[1]?.description || '',
        pillar_3_title: pillars[2]?.title || '',
        pillar_3_desc: pillars[2]?.description || '',
      };
      await updateSiteSettings('general', merged);
      setStatusMsg({
        state: 'success',
        message: 'About page content saved and published successfully!',
      });
    } catch (err) {
      console.error('Error saving About settings:', err);
      setStatusMsg({
        state: 'error',
        message: err.message || 'Failed to save About page changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  const pillarsList = settings.about_pillars || [];

  return (
    <AdminLayout
      title="About Page Editor"
      subtitle="Edit your profile introduction, biography paragraphs, core engineering pillars, and call-to-action."
    >
      <div className="space-y-8">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <User className="h-4 w-4 text-[#0d47e1] dark:text-[#3cd0a8]" />
            <span>Changes saved here update the public <strong>/about</strong> page immediately.</span>
          </div>

          <Link
            to="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Live About Page
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
            Loading About page content...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            {statusMsg.message && (
              <div
                className={`flex items-center gap-2 rounded-xl p-4 text-xs font-medium ${
                  statusMsg.state === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {statusMsg.state === 'success' ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{statusMsg.message}</span>
              </div>
            )}

            {/* Section 1: Profile & Bio Introduction */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-6">
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  1. Profile Header &amp; Introduction
                </h3>
                <p className="text-xs text-neutral-500">
                  Your name, role badge, photo, and main biography paragraphs displayed at the top of the About page.
                </p>
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
                    Professional Role / Title
                  </label>
                  <input
                    type="text"
                    value={settings.author_title || ''}
                    onChange={(e) => setSettings({ ...settings, author_title: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Avatar URL + Upload / Library Picker */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Profile Photo
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
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0d47e1] px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs transition hover:bg-blue-700 disabled:opacity-60 dark:bg-[#05dcef] dark:text-neutral-950 cursor-pointer"
                    >
                      <Upload className="h-3 w-3" />
                      {uploadingAvatar ? 'Uploading...' : 'Choose Image'}
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenMediaPicker}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 cursor-pointer"
                    >
                      <ImageIcon className="h-3 w-3" />
                      Library
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                    {settings.author_avatar ? (
                      <img
                        src={settings.author_avatar}
                        alt="Avatar Preview"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-400">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.author_avatar || ''}
                    placeholder="https://... or click Choose Image"
                    onChange={(e) => setSettings({ ...settings, author_avatar: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Lead Paragraph (Short Bio — also shown on Sidebar &amp; CV)
                </label>
                <textarea
                  rows={3}
                  value={settings.author_bio || ''}
                  onChange={(e) => setSettings({ ...settings, author_bio: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-xs leading-relaxed text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  About Paragraph 2 (What You Write About)
                </label>
                <textarea
                  rows={3}
                  value={settings.about_p1 || ''}
                  onChange={(e) => setSettings({ ...settings, about_p1: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-xs leading-relaxed text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  About Paragraph 3 (Mission &amp; Goals)
                </label>
                <textarea
                  rows={3}
                  value={settings.about_p2 || ''}
                  onChange={(e) => setSettings({ ...settings, about_p2: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-xs leading-relaxed text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>
            </div>

            {/* Section 2: Core Engineering Pillars */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    2. Core Pillars ({pillarsList.length} Highlight {pillarsList.length === 1 ? 'Card' : 'Cards'})
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Customize the feature cards displayed below your biography on the About page, or add more cards.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddPillarCard}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1d63ed] via-[#1595d6] to-[#2eb886] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:brightness-110 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add More Card
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {pillarsList.map((card, index) => (
                  <div
                    key={card.id || index}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 space-y-3 dark:border-neutral-800 dark:bg-neutral-900/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-[#efe4c8] p-1.5 text-[#6b4c1b] dark:bg-neutral-800 dark:text-[#05dcef]">
                          {renderPillarIcon(card.icon)}
                        </div>
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          Card {index + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <select
                          value={card.icon || 'code'}
                          onChange={(e) => handleUpdatePillarCard(index, 'icon', e.target.value)}
                          title="Choose card icon"
                          className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {pillarsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePillarCard(index)}
                            title="Remove card"
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={card.title || ''}
                        onChange={(e) => handleUpdatePillarCard(index, 'title', e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={card.description || ''}
                        onChange={(e) => handleUpdatePillarCard(index, 'description', e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}

                {/* Add More Card Tile */}
                <button
                  type="button"
                  onClick={handleAddPillarCard}
                  className="flex min-h-[190px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/30 p-6 text-neutral-500 transition hover:border-[#0d47e1] hover:bg-blue-50/30 hover:text-[#0d47e1] dark:border-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-400 dark:hover:border-[#05dcef] dark:hover:text-[#05dcef] cursor-pointer"
                >
                  <div className="rounded-full bg-neutral-200/70 p-2.5 dark:bg-neutral-800">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">+ Add More Card</span>
                </button>
              </div>
            </div>

            {/* Section 3: Bottom Call-to-Action Banner */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-5">
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  3. Bottom Contact Call-to-Action
                </h3>
                <p className="text-xs text-neutral-500">
                  The invitation banner at the bottom of the About page that links to your Contact form.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    CTA Heading
                  </label>
                  <input
                    type="text"
                    value={settings.about_cta_title || ''}
                    onChange={(e) => setSettings({ ...settings, about_cta_title: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    CTA Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.about_cta_desc || ''}
                    onChange={(e) => setSettings({ ...settings, about_cta_desc: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1d63ed] via-[#1595d6] to-[#2eb886] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save About Page'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Media Library Image Picker Modal */}
        {showMediaPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Choose Profile Photo from Media Library
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
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
