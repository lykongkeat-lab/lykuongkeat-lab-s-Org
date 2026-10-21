import React, { useState, useEffect } from 'react';
import { FolderTree, PlusCircle, Edit3, Trash2, Check, AlertCircle, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../lib/api';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [autoSlug, setAutoSlug] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCat(null);
    setForm({ name: '', slug: '', description: '' });
    setAutoSlug(true);
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCat(cat);
    setForm({ name: cat.name || '', slug: cat.slug || '', description: cat.description || '' });
    setAutoSlug(false);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleNameChange = (val) => {
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug
        ? val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        : prev.slug,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      setErrorMsg('Please enter a category name and slug.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, form);
      } else {
        await createCategory(form);
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      console.error('Save category error:', err);
      setErrorMsg(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? Articles linked to this category will have category set to null.`)) {
      return;
    }
    try {
      await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err) {
      alert('Failed to delete category: ' + err.message);
    }
  };

  return (
    <AdminLayout
      title="Category Manager"
      subtitle="Organize articles by engineering topics, frameworks, and architecture patterns."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </span>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <PlusCircle className="h-4 w-4" /> Add Category
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-300">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400">
              <tr>
                <th scope="col" className="px-6 py-3.5">Name</th>
                <th scope="col" className="px-6 py-3.5">Slug</th>
                <th scope="col" className="px-6 py-3.5">Description</th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-neutral-400">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-neutral-400">
                    No categories found. Click above to add one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
                    <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-500">
                      /category/{cat.slug}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 max-w-sm truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl transition-colors dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  {editingCat ? 'Edit Category' : 'Create Category'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. System Architecture"
                    className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      URL Slug *
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-neutral-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                        className="rounded"
                      />
                      Auto-slug
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => {
                      setForm({ ...form, slug: e.target.value });
                      setAutoSlug(false);
                    }}
                    placeholder="system-architecture"
                    className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 font-mono text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description of this engineering domain..."
                    className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
                  >
                    {saving ? 'Saving...' : editingCat ? 'Save Changes' : 'Create'}
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
