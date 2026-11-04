import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer,
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  ExternalLink, 
  Terminal,
  Sparkles
} from 'lucide-react';
import Layout from '../components/Layout';
import { useLanguage } from '../lib/LanguageContext';
import { getCVData, getSiteSettings } from '../lib/api';

export default function CVPage() {
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [cvRes, siteRes] = await Promise.all([
          getCVData({ includeHidden: false }),
          getSiteSettings('general'),
        ]);

        if (mounted) {
          setSections(cvRes || []);
          setSettings(siteRes || null);
        }
      } catch (err) {
        console.error('Error loading CV data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const getSectionIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'briefcase':
      case 'work':
      case 'experience':
        return <Briefcase className="h-5 w-5 text-[#111827] dark:text-[#05dcef]" />;
      case 'education':
      case 'graduation':
        return <GraduationCap className="h-5 w-5 text-[#111827] dark:text-[#05dcef]" />;
      case 'skills':
      case 'code':
        return <Code className="h-5 w-5 text-[#111827] dark:text-[#05dcef]" />;
      case 'award':
      case 'certification':
        return <Award className="h-5 w-5 text-[#111827] dark:text-[#05dcef]" />;
      default:
        return <Terminal className="h-5 w-5 text-[#111827] dark:text-[#05dcef]" />;
    }
  };

  const authorName = settings?.author_name || 'Ly Kuongkeat';
  const authorTitle = settings?.author_title || 'Software Engineer';
  const authorBio = settings?.author_bio || 'Specializing in full-stack web architectures, React, TypeScript, and cloud-native solutions.';
  const authorAvatar =
    settings?.author_avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  return (
    <Layout showSidebar={false} className="max-w-4xl mx-auto">
      <div className="space-y-12 cv-printable">
        {/* CV Hero Header */}
        <div className="rounded-3xl border border-[#e2e5ec] bg-[#ffffff] p-8 sm:p-10 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl ring-4 ring-[#2bb8d6] shadow-sm dark:ring-neutral-800">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#efe4c8] px-3.5 py-1 text-xs font-semibold text-[#6b4c1b] dark:bg-[#05dcef]/20 dark:text-[#05dcef]">
                  <Sparkles className="h-3.5 w-3.5 text-[#8c6222] dark:text-[#05dcef]" /> {t('cv_badge')}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111318] dark:text-white">
                  {authorName}
                </h1>
                <p className="text-base font-bold text-[#0d47e1] dark:text-[#05dcef]">
                  {authorTitle}
                </p>
                <p className="max-w-xl text-sm leading-relaxed text-[#2c313c] dark:text-neutral-300 pt-1">
                  {authorBio}
                </p>
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center justify-center sm:justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1d63ed] via-[#1595d6] to-[#2eb886] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                {t('print_cv')}
              </button>

              {settings?.cv_pdf_url && (
                <a
                  href={settings.cv_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e2e5ec] bg-[#ffffff] px-4 py-2.5 text-sm font-bold text-[#111318] shadow-2xs transition hover:border-[#0d47e1] hover:text-[#0d47e1] dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:border-[#05dcef] dark:hover:text-[#05dcef]"
                >
                  <Download className="h-4 w-4" />
                  {t('download_pdf')}
                </a>
              )}
            </div>
          </div>
          <div className="mt-6 h-1.5 w-full rounded-full bg-gradient-to-r from-[#1d4ed8] via-[#10b981] to-[#d9822b]" />
        </div>

        {/* Dynamic CV Sections from cv_sections and cv_items */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-[#e2e5ec] bg-[#ffffff] dark:border-neutral-800 dark:bg-neutral-900"
              />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="rounded-2xl border border-[#e2e5ec] bg-[#ffffff] p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <FileText className="mx-auto h-8 w-8 text-[#0d47e1] mb-2" />
            <h3 className="text-base font-bold text-[#111318] dark:text-white">
              {t('cv_updating_title')}
            </h3>
            <p className="mt-1 text-sm text-[#4a5162] dark:text-neutral-400">
              {t('cv_updating_desc')}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.id} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#e2e5ec] pb-3 dark:border-neutral-800">
                  <div className="rounded-lg bg-gradient-to-br from-[#2bb8d6] to-[#3cd0a8] p-2 dark:bg-neutral-800">
                    {getSectionIcon(section.icon)}
                  </div>
                  <h2 className="text-2xl font-bold text-[#111318] dark:text-white">
                    {section.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(section.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl border border-[#e2e5ec] bg-[#ffffff] p-5 transition hover:border-[#1d63ed]/50 hover:shadow-xs dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-[#111318] dark:text-white">
                              {item.label}
                            </h3>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0d47e1] hover:text-[#1d63ed] dark:hover:text-[#05dcef]"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {item.subtitle && (
                            <p className="font-mono tabular-nums text-xs font-bold text-[#0d47e1] dark:text-[#05dcef]">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-[#4a5162] dark:text-neutral-300 whitespace-pre-wrap">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
