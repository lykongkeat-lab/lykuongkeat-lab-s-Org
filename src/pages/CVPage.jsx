import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Terminal,
  Sparkles
} from 'lucide-react';
import Layout from '../components/Layout';
import { getCVData, getSiteSettings } from '../lib/api';

export default function CVPage() {
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

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
        return <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case 'education':
      case 'graduation':
        return <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'skills':
      case 'code':
        return <Code className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case 'award':
      case 'certification':
        return <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Terminal className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const authorName = settings?.author_name || 'Ly Kuongkeat';
  const authorTitle = settings?.author_title || 'Software Engineer';
  const authorBio = settings?.author_bio || 'Specializing in full-stack web architectures, React, TypeScript, and cloud-native solutions.';

  return (
    <Layout showSidebar={false} className="max-w-4xl mx-auto">
      <div className="space-y-12">
        {/* CV Hero Header */}
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50/60 p-8 sm:p-10 dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" /> Curriculum Vitae
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                {authorName}
              </h1>
              <p className="text-base font-medium text-emerald-600 dark:text-emerald-400">
                {authorTitle}
              </p>
              <p className="max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 pt-1">
                {authorBio}
              </p>
            </div>

            {settings?.cv_pdf_url && (
              <div className="shrink-0">
                <a
                  href={settings.cv_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic CV Sections from cv_sections and cv_items */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
              />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
            <FileText className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              CV Content Being Updated
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              The CV sections will appear here as soon as they are added in the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.id} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
                  <div className="rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800">
                    {getSectionIcon(section.icon)}
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(section.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-xs dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                              {item.label}
                            </h3>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {item.subtitle && (
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
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
