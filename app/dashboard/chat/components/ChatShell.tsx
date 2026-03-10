'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TreasuryTicker from './TreasuryTicker';

interface ChatShellProps {
  sidebarContent: React.ReactNode;
  sidebarFooter: React.ReactNode;
  headerTitle: string;
  headerRight?: React.ReactNode;
  onNewChat: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchDisabled?: boolean;
  children: React.ReactNode;
}

export default function ChatShell({
  sidebarContent,
  sidebarFooter,
  headerTitle,
  headerRight,
  onNewChat,
  searchValue,
  onSearchChange,
  searchDisabled,
  children,
}: ChatShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Sidebar header */}
            <div className="p-4 border-b border-gray-200 min-w-[280px]">
              <button
                onClick={onNewChat}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
              >
                + New Chat
              </button>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search chats..."
                disabled={searchDisabled}
                className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:border-[#2383e2] focus:outline-none focus:ring-1 focus:ring-[#2383e2] disabled:opacity-50"
              />
            </div>

            {/* Sidebar content - scrollable */}
            <div className="flex-1 overflow-y-auto min-w-[280px]">
              {sidebarContent}
            </div>

            {/* Sidebar footer */}
            <div className="p-3 border-t border-gray-200 min-w-[280px]">
              {sidebarFooter}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-medium text-gray-900 truncate flex-1">
            {headerTitle}
          </h1>
          {headerRight}
        </header>

        {/* Treasury yield ticker */}
        <TreasuryTicker />

        {/* Main content */}
        {children}
      </div>
    </div>
  );
}
