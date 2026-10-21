import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Plus, 
  ExternalLink, 
  X, 
  AlertCircle 
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  getCVData, 
  createCVSection, 
  updateCVSection, 
  deleteCVSection, 
  createCVItem, 
  updateCVItem, 
  deleteCVItem 
} from '../../lib/api';

export default function CVAdmin() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Section Modal state
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    key: '',
    title: '',
    icon: 'briefcase',
    position: 0,
    is_visible: true,
  });

  // Item Modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    label: '',
    value: '',
    subtitle: '',
    url: '',
    position: 0,
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadCV = async () => {
    setLoading(true);
    try {
      const data = await getCVData({ includeHidden: true });
      setSections(data || []);
    } catch (err) {
      console.error('Error loading CV data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCV();
  }, []);

  // Section Actions
  const openNewSectionModal = () => {
    setEditingSection(null);
    setSectionForm({
      key: `section-${Date.now()}`,
      title: '',
      icon: 'briefcase',
      position: sections.length,
      is_visible: true,
    });
    setErrorMsg('');
    setSectionModalOpen(true);
  };

  const openEditSectionModal = (sec) => {
    setEditingSection(sec);
    setSectionForm({
      key: sec.key,
      title: sec.title,
      icon: sec.icon || 'briefcase',
      position: sec.position || 0,
      is_visible: sec.is_visible,
    });
    setErrorMsg('');
    setSectionModalOpen(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.title.trim()) {
      setErrorMsg('Please specify a section title.');
      return;
    }

    setSaving(true);
    try {
      if (editingSection) {
        await updateCVSection(editingSection.id, sectionForm);
      } else {
        await createCVSection(sectionForm);
      }
      setSectionModalOpen(false);
      await loadCV();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save section.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sec) => {
    if (!window.confirm(`Delete entire section "${sec.title}" and all its rows?`)) return;
    try {
      await deleteCVSection(sec.id);
      setSections((prev) => prev.filter((s) => s.id !== sec.id));
    } catch (err) {
      alert('Error deleting section: ' + err.message);
    }
  };

  // Item Actions
  const openNewItemModal = (sectionId) => {
    setTargetSectionId(sectionId);
    setEditingItem(null);
    setItemForm({
      label: '',
      value: '',
      subtitle: '',
      url: '',
      position: 0,
    });
    setErrorMsg('');
    setItemModalOpen(true);
  };

  const openEditItemModal = (sectionId, item) => {
    setTargetSectionId(sectionId);
    setEditingItem(item);
    setItemForm({
      label: item.label,
      value: item.value,
      subtitle: item.subtitle || '',
      url: item.url || '',
      position: item.position || 0,
    });
    setErrorMsg('');
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.label.trim() || !itemForm.value.trim()) {
      setErrorMsg('Please fill in label and value.');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateCVItem(editingItem.id, itemForm);
      } else {
        await createCVItem({ ...itemForm, section_id: targetSectionId });
      }
      setItemModalOpen(false);
      await loadCV();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save CV row.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this CV row?')) return;
    try {
      await deleteCVItem(itemId);
      await loadCV();
    } catch (err) {
      alert('Error deleting CV item: ' + err.message);
    }
  };

  return (
    <AdminLayout
      title="Curriculum Vitae (CV) Editor"
      subtitle="Add, organize, and edit career milestones, education, skills, and projects."
    >
      <div className="space-y-6">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">
            {sections.length} {sections.length === 1 ? 'section' : 'sections'} configured
          </span>
          <button
            onClick={openNewSectionModal}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <PlusCircle className="h-4 w-4" /> Add Section
          </button>
        </div>

        {/* Section List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading CV data...</div>
        ) : sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              No CV sections yet. Add your first section like &ldquo;Work Experience&rdquo; or &ldquo;Skills&rdquo;.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4"
              >
                {/* Section Bar */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      {sec.title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-neutral-400">
                      ({sec.icon || 'briefcase'})
                    </span>
                    {!sec.is_visible && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800">
                        Hidden from public
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openNewItemModal(sec.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Row
                    </button>
                    <button
                      onClick={() => openEditSectionModal(sec)}
                      className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(sec)}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rows inside section */}
                <div className="space-y-3">
                  {(sec.items || []).length === 0 ? (
                    <p className="text-xs text-neutral-400 italic py-2">
                      No rows in this section yet. Click &ldquo;Add Row&rdquo; above.
                    </p>
                  ) : (
                    sec.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between rounded-xl border border-neutral-200 bg-neutral-50/50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900 dark:text-white">
                              {item.label}
                            </span>
                            {item.subtitle && (
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                • {item.subtitle}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                            {item.value}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-4">
                          <button
                            onClick={() => openEditItemModal(sec.id, item)}
                            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="rounded-lg p-1 text-neutral-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section Modal */}
        {sectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  {editingSection ? 'Edit Section' : 'Create Section'}
                </h3>
                <button
                  onClick={() => setSectionModalOpen(false)}
                  className="rounded-lg p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSection} className="mt-4 space-y-4">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                    placeholder="e.g. Work Experience, Education, Technical Skills"
                    className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Icon Name
                    </label>
                    <select
                      value={sectionForm.icon}
                      onChange={(e) => setSectionForm({ ...sectionForm, icon: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    >
                      <option value="briefcase">Work (Briefcase)</option>
                      <option value="education">Education (Cap)</option>
                      <option value="skills">Skills (Code)</option>
                      <option value="award">Certification / Award</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Sort Position
                    </label>
                    <input
                      type="number"
                      value={sectionForm.position}
                      onChange={(e) => setSectionForm({ ...sectionForm, position: parseInt(e.target.value, 10) || 0 })}
                      className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sectionForm.is_visible}
                      onChange={(e) => setSectionForm({ ...sectionForm, is_visible: e.target.checked })}
                      className="rounded"
                    />
                    Visible on Public CV page
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSectionModalOpen(false)}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
                  >
                    {saving ? 'Saving...' : editingSection ? 'Update Section' : 'Create Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Item Modal */}
        {itemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  {editingItem ? 'Edit CV Row' : 'Add CV Row'}
                </h3>
                <button
                  onClick={() => setItemModalOpen(false)}
                  className="rounded-lg p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="mt-4 space-y-4">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Label / Company / Institution *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.label}
                    onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer — ACME Corp"
                    className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Subtitle / Dates
                  </label>
                  <input
                    type="text"
                    value={itemForm.subtitle}
                    onChange={(e) => setItemForm({ ...itemForm, subtitle: e.target.value })}
                    placeholder="e.g. 2022 – Present | Phnom Penh, Cambodia"
                    className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Description / Value *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={itemForm.value}
                    onChange={(e) => setItemForm({ ...itemForm, value: e.target.value })}
                    placeholder="Detailed bullet points, technologies used, responsibilities..."
                    className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Optional URL
                  </label>
                  <input
                    type="url"
                    value={itemForm.url}
                    onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                    placeholder="https://company.com or demo project"
                    className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setItemModalOpen(false)}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
                  >
                    {saving ? 'Saving...' : editingItem ? 'Update Row' : 'Add Row'}
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
