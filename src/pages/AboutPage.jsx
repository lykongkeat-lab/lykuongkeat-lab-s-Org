import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Github, Linkedin, Twitter, Mail, ArrowRight, Code, Server, Cpu } from 'lucide-react';
import Layout from '../components/Layout';
import { getSiteSettings } from '../lib/api';

export default function AboutPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let mounted = true;
    getSiteSettings('general').then((data) => {
      if (mounted && data) setSettings(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const authorName = settings?.author_name || 'Ly Kuongkeat';
  const authorTitle = settings?.author_title || 'Software Engineer';
  const authorBio =
    settings?.author_bio ||
    'I write articles about web development, coding architectures, and real problems encountered in production software development.';
  const authorAvatar =
    settings?.author_avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  return (
    <Layout>
      <div className="space-y-10">
        {/* Intro Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl ring-4 ring-neutral-100 dark:ring-neutral-800">
              <img
                src={authorAvatar}
                alt={authorName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                About {authorName}
              </h1>
              <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                {authorTitle}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                {settings?.social_github && (
                  <a
                    href={settings.social_github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {settings?.social_linkedin && (
                  <a
                    href={settings.social_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {settings?.social_twitter && (
                  <a
                    href={settings.social_twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-sky-500"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="prose prose-neutral prose-lg dark:prose-invert max-w-none leading-relaxed text-neutral-700 dark:text-neutral-300">
            <p>{authorBio}</p>
            <p>
              Welcome to my personal tech blog. Here, I document real challenges, architectural solutions, and coding techniques that come up while designing, building, and maintaining production applications.
            </p>
            <p>
              My goal is to share honest reflections, detailed benchmarks, and code recipes that save other developers time and headaches.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40 space-y-2">
            <Code className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Clean Engineering</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Pragmatic TypeScript, modular React patterns, and clean separation of concerns.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40 space-y-2">
            <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Backend &amp; DBs</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              PostgreSQL relational modeling, Row Level Security, Edge Workers, and APIs.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40 space-y-2">
            <Cpu className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Performance</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Real-world latency optimizations, bundle profiling, and edge CDN delivery.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-neutral-900 p-8 text-white dark:bg-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Have a technical question or idea?</h3>
            <p className="text-xs text-neutral-400">
              I am always happy to discuss interesting engineering problems.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-neutral-900 transition hover:bg-neutral-100"
          >
            Get In Touch <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
