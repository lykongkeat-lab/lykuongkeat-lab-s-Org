import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  MousePointerClick, 
  Calendar, 
  Check, 
  X, 
  AlertCircle, 
  ExternalLink,
  Code2,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdSlot from '../../components/AdSlot';
import { getAllAds, createAd, updateAd, deleteAd } from '../../lib/api';

const SLOTS = [
  { value: 'header', label: 'Header (Top Banner)' },
  { value: 'sidebar_top', label: 'Sidebar Top' },
  { value: 'sidebar_bottom', label: 'Sidebar Bottom' },
  { value: 'in_article', label: 'In-Article (Mid Content)' },
  { value: 'below_post', label: 'Below Post (End of Article)' },
  { value: 'footer', label: 'Footer (Above Copyright)' },
];

export default function AdsAdmin() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotFilter, setSlotFilter] = useState('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [form, setForm] = useState({
    name: '',
    slot: 'sidebar_top',
    ad_type: 'image', // 'image' or 'script'
    image_url: '',
    link_url: '',
    script_code: '',
    width: '',
    height: '',
    position: 0,
    is_active: true,
    starts_at: '',
    ends_at: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAds = async () => {
    setLoading(true);
    try {
      const data = await getAllAds();
      setAds(data || []);
    } catch (err) {
      console.error('Error fetching ads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const openCreateModal = () => {
    setEditingAd(null);
    setForm({
      name: '',
      slot: 'sidebar_top',
      ad_type: 'image',
      image_url: '',
      link_url: '',
      script_code: '',
      width: '',
      height: '',
      position: ads.length,
      is_active: true,
      starts_at: '',
      ends_at: '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setForm({
      name: ad.name || '',
      slot: ad.slot || 'sidebar_top',
      ad_type: ad.ad_type || 'image',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      script_code: ad.script_code || '',
      width: ad.width || '',
      height: ad.height || '',
      position: ad.position || 0,
      is_active: Boolean(ad.is_active),
      starts_at: ad.starts_at ? new Date(ad.starts_at).toISOString().slice(0, 16) : '',
      ends_at: ad.ends_at ? new Date(ad.ends_at).toISOString().slice(0, 16) : '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name.trim()) {
      setErrorMsg('Please specify an advertisement name.');
      return;
    }

    if (form.ad_type === 'image' && !form.image_url.trim()) {
      setErrorMsg('Please provide an image URL for this image ad.');
      return;
    }

    if (form.ad_type === 'script' && !form.script_code.trim()) {
      setErrorMsg('Please paste the script or HTML embed code.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slot: form.slot,
        ad_type: form.ad_type,
        image_url: form.ad_type === 'image' ? form.image_url.trim() : null,
        link_url: form.ad_type === 'image' ? form.link_url.trim() || null : null,
        script_code: form.ad_type === 'script' ? form.script_code : null,
        width: form.width ? parseInt(form.width, 10) : null,
        height: form.height ? parseInt(form.height, 10) : null,
        position: parseInt(form.position, 10) || 0,
        is_active: form.is_active,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      };

      if (editingAd) {
        await updateAd(editingAd.id, payload);
      } else {
        await createAd(payload);
      }

      setIsModalOpen(false);
      await loadAds();
    } catch (err) {
      console.error('Error saving ad:', err);
      setErrorMsg(err.message || 'Failed to save advertisement.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ad) => {
    try {
      const is_active = !ad.is_active;
      await updateAd(ad.id, { is_active });
      setAds((prev) =>
        prev.map((item) => (item.id === ad.id ? { ...item, is_active } : item))
      );
    } catch (err) {
      alert('Error updating ad status: ' + err.message);
    }
  };

  const handleDelete = async (ad) => {
    if (!window.confirm(`Delete advertisement "${ad.name}"?`)) return;
    try {
      await deleteAd(ad.id);
      setAds((prev) => prev.filter((item) => item.id !== ad.id));
    } catch (err) {
      alert('Failed to delete ad: ' + err.message);
    }
  };

  const filteredAds =
    slotFilter === 'all' ? ads : ads.filter((ad) => ad.slot === slotFilter);

  return (
    <AdminLayout
      title="Advertisement Manager"
      subtitle="Configure banner placements, Google AdSense scripts, impressions, and click tracking."
    >
      <div className="space-y-6">
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              <option value="all">All Placement Slots</option>
              {SLOTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <span className="text-xs text-neutral-500">
              {filteredAds.length} {filteredAds.length === 1 ? 'ad' : 'ads'}
            </span>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <PlusCircle className="h-4 w-4" />
            Add New Ad
          </button>
        </div>

        {/* Ads Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-300">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Ad / Placement
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Schedule
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Performance (Stats)
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-neutral-400">
                      Loading advertisements...
                    </td>
                  </tr>
                ) : filteredAds.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-neutral-400">
                      No advertisements configured for this slot yet.
                    </td>
                  </tr>
                ) : (
                  filteredAds.map((ad) => {
                    const impressions = ad.impressions || 0;
                    const clicks = ad.clicks || 0;
                    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

                    return (
                      <tr
                        key={ad.id}
                        className="transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40"
                      >
                        {/* Name & Slot */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {ad.ad_type === 'image' && ad.image_url ? (
                              <img
                                src={ad.image_url}
                                alt=""
                                className="h-10 w-16 shrink-0 rounded object-cover bg-neutral-100 dark:bg-neutral-800"
                              />
                            ) : (
                              <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded bg-neutral-100 font-mono text-[10px] text-neutral-400 dark:bg-neutral-800">
                                &lt;script&gt;
                              </div>
                            )}

                            <div>
                              <p className="font-bold text-neutral-900 dark:text-white">
                                {ad.name}
                              </p>
                              <span className="inline-block rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                Slot: {ad.slot}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Ad Type */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            ad.ad_type === 'image'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          }`}>
                            {ad.ad_type === 'image' ? <ImageIcon className="h-3 w-3" /> : <Code2 className="h-3 w-3" />}
                            {ad.ad_type === 'image' ? 'Image Banner' : 'HTML / JS Script'}
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(ad)}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                              ad.is_active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            {ad.is_active ? 'Active' : 'Paused'}
                          </button>
                        </td>

                        {/* Schedule */}
                        <td className="px-6 py-4 text-[11px] text-neutral-500 dark:text-neutral-400">
                          {ad.starts_at || ad.ends_at ? (
                            <div className="space-y-0.5">
                              {ad.starts_at && (
                                <p>From: {new Date(ad.starts_at).toLocaleDateString()}</p>
                              )}
                              {ad.ends_at && (
                                <p>To: {new Date(ad.ends_at).toLocaleDateString()}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-neutral-400">Runs Indefinitely</span>
                          )}
                        </td>

                        {/* Impressions, Clicks, CTR */}
                        <td className="px-6 py-4 font-mono text-[11px]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-400">Views:</span>
                              <span className="font-bold text-neutral-900 dark:text-white">{impressions}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-400">Clicks:</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{clicks}</span>
                              <span className="text-[10px] text-neutral-400">({ctr}% CTR)</span>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {ad.link_url && (
                              <a
                                href={ad.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open Link URL"
                                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => openEditModal(ad)}
                              title="Edit Ad"
                              className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(ad)}
                              title="Delete Ad"
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create or Edit Advertisement */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl transition-colors dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-purple-600" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-5 space-y-4">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Ad Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Supabase Launch Banner"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Placement Slot *
                    </label>
                    <select
                      value={form.slot}
                      onChange={(e) => setForm({ ...form, slot: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    >
                      {SLOTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Ad Type *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, ad_type: 'image' })}
                        className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${
                          form.ad_type === 'image'
                            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                            : 'border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                        }`}
                      >
                        Image Ad
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, ad_type: 'script' })}
                        className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${
                          form.ad_type === 'script'
                            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                            : 'border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                        }`}
                      >
                        Script / Embed
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Priority Position
                    </label>
                    <input
                      type="number"
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Conditional Fields based on Ad Type */}
                {form.ad_type === 'image' ? (
                  <div className="space-y-4 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900/50">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        Image URL (or R2 CDN link) *
                      </label>
                      <input
                        type="url"
                        value={form.image_url}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        placeholder="https://... image banner"
                        className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        Destination Link URL
                      </label>
                      <input
                        type="url"
                        value={form.link_url}
                        onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                        placeholder="https://partner-website.com/?ref=blog"
                        className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Max Width (px, optional)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 728"
                          value={form.width}
                          onChange={(e) => setForm({ ...form, width: e.target.value })}
                          className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Max Height (px, optional)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 90"
                          value={form.height}
                          onChange={(e) => setForm({ ...form, height: e.target.value })}
                          className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900/50">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Script / HTML Code (Google AdSense, etc.) *
                    </label>
                    <textarea
                      rows={6}
                      value={form.script_code}
                      onChange={(e) => setForm({ ...form, script_code: e.target.value })}
                      placeholder="<script async src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'></script>..."
                      className="w-full rounded-xl border border-neutral-300 bg-white p-3 font-mono text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                    <p className="text-[11px] text-neutral-400">
                      The frontend will dynamically instantiate and execute any enclosed &lt;script&gt; elements.
                    </p>
                  </div>
                )}

                {/* Scheduling & Activation */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Start Date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      End Date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.ends_at}
                      onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    Ad is Active &amp; Ready to Display
                  </label>
                </div>

                {/* Modal footer buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
                  >
                    {saving ? 'Saving...' : editingAd ? 'Update Ad' : 'Create Ad'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
