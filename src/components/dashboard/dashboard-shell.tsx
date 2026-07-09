"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-50">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 md:hidden dark:border-stone-800 dark:bg-stone-900">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold">fullstack</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
