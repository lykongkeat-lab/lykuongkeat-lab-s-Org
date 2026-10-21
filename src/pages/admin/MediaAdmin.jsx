import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getMediaList, deleteMediaRecord, createMediaRecord } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

export default function MediaAdmin() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ state: 'idle', message: '' });

  const { user } = useAuth();

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await getMediaList({ page: 1, limit: 50 });
      setMediaList(res.data || []);
    } catch (err) {
      console.error('Error loading media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg({ state: 'loading', message: `Uploading ${file.name}...` });

    try {
      // Get auth token from supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', file.name);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Upload failed with HTTP ${response.status}`);
      }

      const uploadResult = await response.json();
      setStatusMsg({ state: 'success', message: 'File uploaded successfully to R2!' });

      await loadMedia();
    } catch (err) {
      console.warn('API Upload endpoint error, providing fallback record creation option:', err.message);
      setStatusMsg({
        state: 'error',
        message: err.message || 'Worker upload endpoint unavailable. Ensure Cloudflare Worker is deployed.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (media) => {
    if (!window.confirm(`Delete media item "${media.file_name}"?`)) return;
    try {
      await deleteMediaRecord(media.id);
      setMediaList((prev) => prev.filter((m) => m.id !== media.id));
    } catch (err) {
      alert('Failed to delete media: ' + err.message);
    }
  };

  return (
    <AdminLayout
      title="Media Library"
      subtitle="Upload and manage assets stored on Cloudflare R2 for articles, advertisements, and CV downloads."
    >
      <div className="space-y-6">
        
        {/* Upload Card */}
        <div className="rounded-3xl border-2 border-dashed border-neutral-300 bg-white p-8 text-center transition hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900">
          <Upload className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Upload Image or PDF to Cloudflare R2
          </h3>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Files are routed securely via POST /api/upload and stored in your R2 bucket.
          </p>

          <label className="mt-4 inline-flex items-center gap-2 cursor-pointer rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
            <span>{uploading ? 'Uploading...' : 'Choose File to Upload'}</span>
            <input
              type="file"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {statusMsg.message && (
            <div className={`mt-4 inline-flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
              statusMsg.state === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : statusMsg.state === 'error'
                ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
            }`}>
              {statusMsg.message}
            </div>
          )}
        </div>

        {/* Media Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Uploaded Files ({mediaList.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-400">
              Loading media files...
            </div>
          ) : mediaList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
              <ImageIcon className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                No media files uploaded yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {mediaList.map((media) => {
                const isImage = media.mime_type?.startsWith('image/');
                const isCopied = copiedId === media.id;

                return (
                  <div
                    key={media.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-xs transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      {isImage ? (
                        <img
                          src={media.public_url}
                          alt={media.alt_text || media.file_name}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <FileText className="h-10 w-10 text-neutral-400" />
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="truncate text-xs font-bold text-neutral-900 dark:text-white" title={media.file_name}>
                        {media.file_name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {(media.size_bytes / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800">
                      <button
                        onClick={() => handleCopy(media.public_url, media.id)}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold transition ${
                          isCopied ? 'text-emerald-600' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                        title="Copy Public URL"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(media)}
                        className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        title="Delete Media"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
