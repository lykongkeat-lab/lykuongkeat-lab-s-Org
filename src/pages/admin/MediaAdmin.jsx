import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  FileText,
  UserCheck
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  getMediaList, 
  deleteMediaRecord, 
  uploadMediaFile, 
  getSiteSettings, 
  updateSiteSettings 
} from '../../lib/api';

export default function MediaAdmin() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [settingAvatarId, setSettingAvatarId] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ state: 'idle', message: '' });

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
      const result = await uploadMediaFile(file, file.name);
      setStatusMsg({
        state: 'success',
        message:
          result.source === 'r2'
            ? 'File uploaded successfully to Cloudflare R2!'
            : 'Image processed and saved to Media Library!',
      });
      await loadMedia();
    } catch (err) {
      console.warn('Upload error:', err.message);
      setStatusMsg({
        state: 'error',
        message: err.message || 'Upload failed. Please sign out and sign back in to refresh your session.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetAsAvatar = async (media) => {
    setSettingAvatarId(media.id);
    setStatusMsg({ state: 'loading', message: 'Updating Author Avatar...' });
    try {
      const currentSettings = (await getSiteSettings('general')) || {};
      await updateSiteSettings('general', {
        ...currentSettings,
        author_avatar: media.public_url,
      });
      setStatusMsg({
        state: 'success',
        message: `"${media.file_name}" is now set as your Author Avatar!`,
      });
    } catch (err) {
      setStatusMsg({
        state: 'error',
        message: 'Failed to update Author Avatar: ' + (err.message || 'Unknown error'),
      });
    } finally {
      setSettingAvatarId(null);
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
                      <p className="text-[10px] text-neutral-400 font-mono tabular-nums">
                        {((media.size_bytes || 0) / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    {isImage && (
                      <button
                        type="button"
                        disabled={settingAvatarId === media.id}
                        onClick={() => handleSetAsAvatar(media)}
                        className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#0d47e1]/10 px-2 py-1 text-[11px] font-semibold text-[#0d47e1] transition hover:bg-[#0d47e1] hover:text-white disabled:opacity-50 dark:bg-[#05dcef]/15 dark:text-[#05dcef] dark:hover:bg-[#05dcef] dark:hover:text-neutral-950"
                        title="Use this photo as your Author Avatar"
                      >
                        <UserCheck className="h-3 w-3" />
                        <span>{settingAvatarId === media.id ? 'Saving...' : 'Set as Avatar'}</span>
                      </button>
                    )}

                    <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800">
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

