import React, { useState, useEffect } from 'react';
import { Mail, Check, Trash2, MailOpen, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getContactMessages, markMessageRead, deleteContactMessage } from '../../lib/api';

export default function MessagesAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getContactMessages();
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleToggleRead = async (msg) => {
    try {
      const is_read = !msg.is_read;
      await markMessageRead(msg.id, is_read);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read } : m))
      );
    } catch (err) {
      alert('Error updating message status: ' + err.message);
    }
  };

  const handleDelete = async (msg) => {
    if (!window.confirm(`Delete message from "${msg.name}"?`)) return;
    try {
      await deleteContactMessage(msg.id);
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    } catch (err) {
      alert('Error deleting message: ' + err.message);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <AdminLayout
      title="Contact Form Messages"
      subtitle="Read and manage inquiries sent through the public contact page."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">
            {messages.length} total {messages.length === 1 ? 'message' : 'messages'} ({unreadCount} unread)
          </span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
              <Mail className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                No contact messages received yet.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-2xl border p-5 shadow-xs transition ${
                  msg.is_read
                    ? 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
                    : 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {msg.name}
                    </span>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      &lt;{msg.email}&gt;
                    </a>
                    {!msg.is_read && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        New
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-neutral-400">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="py-2">
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                    Subject: {msg.subject}
                  </h4>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => handleToggleRead(msg)}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {msg.is_read ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
                    {msg.is_read ? 'Mark Unread' : 'Mark as Read'}
                  </button>

                  <button
                    onClick={() => handleDelete(msg)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Message"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
