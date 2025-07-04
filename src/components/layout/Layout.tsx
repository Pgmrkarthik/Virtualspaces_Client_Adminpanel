// src/components/layout/Layout.tsx
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        {/* Sidebar for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-64 bg-white dark:bg-gray-900 h-full shadow-lg z-50">
              <Sidebar />
              <button
                className="absolute top-2 right-2 text-gray-700 dark:text-gray-200"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;