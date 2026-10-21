import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import AdSlot from './AdSlot';

export default function Layout({ children, showSidebar = true, className = '' }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white transition-colors duration-200 dark:bg-neutral-950 dark:text-neutral-100 dark:selection:bg-white dark:selection:text-neutral-900">
      {/* 1. Top Global Navigation */}
      <Header />

      {/* 2. Top Header Advertisement Slot */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot slot="header" />
      </div>

      {/* 3. Main Content Area */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {showSidebar ? (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Primary Page Content */}
            <main className={`lg:col-span-8 min-w-0 ${className}`}>
              {children}
            </main>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 min-w-0">
              <Sidebar />
            </div>
          </div>
        ) : (
          <main className={`w-full min-w-0 ${className}`}>
            {children}
          </main>
        )}
      </div>

      {/* 4. Global Footer */}
      <Footer />
    </div>
  );
}
