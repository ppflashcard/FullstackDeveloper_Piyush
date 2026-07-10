"use client";

import { useEffect, useState } from "react";

import { PLAN_CREDITS } from "@/lib/api-key-limits";

type CurrentPlanCardProps = {
  totalUsage: number;
};

export function CurrentPlanCard({ totalUsage }: CurrentPlanCardProps) {
  const [payAsYouGo, setPayAsYouGo] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pay-as-you-go");
    if (stored) setPayAsYouGo(stored === "true");
  }, []);

  function togglePayAsYouGo() {
    const next = !payAsYouGo;
    setPayAsYouGo(next);
    localStorage.setItem("pay-as-you-go", String(next));
  }

  const usagePercent = Math.min((totalUsage / PLAN_CREDITS) * 100, 100);

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="relative p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-orange-200/60 blur-3xl dark:bg-orange-900/30" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-block rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
              Current Plan
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Researcher</h2>
          </div>
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium hover:border-orange-300 hover:bg-orange-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-orange-950/30"
          >
            <CreditCardIcon className="h-4 w-4 text-stone-500" />
            Manage Plan
          </button>
        </div>

        <div className="relative mt-6 space-y-6 sm:mt-8">
          <div>
            <div className="mb-3 flex items-center gap-1.5">
              <span className="text-sm font-semibold">API Usage</span>
              <InfoIcon className="h-3.5 w-3.5 text-stone-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 dark:text-stone-400">Monthly plan</span>
                <span className="font-medium">
                  {totalUsage} / {PLAN_CREDITS.toLocaleString()} Credits
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-stone-200 pt-5 dark:border-stone-800">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-stone-500 dark:text-stone-400">Pay as you go</span>
              <InfoIcon className="h-3.5 w-3.5 text-stone-400" />
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={payAsYouGo}
              onClick={togglePayAsYouGo}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                payAsYouGo ? "bg-orange-500" : "bg-stone-300 dark:bg-stone-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  payAsYouGo ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
