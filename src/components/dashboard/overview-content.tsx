"use client";

import { OverviewHeader } from "@/components/dashboard/overview-header";
import { CurrentPlanCard } from "@/components/dashboard/current-plan-card";
import { ApiKeysManager } from "@/components/dashboard/api-keys-manager";

export function OverviewContent() {
  return (
    <>
      <OverviewHeader />

      <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
        <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
          <span className="font-medium text-stone-900 dark:text-stone-100">New:</span>{" "}
          Agent skills and API playground integrations are now available for your
          workspace.
        </div>

        <ApiKeysManager
          renderPlan={(totalUsage) => (
            <CurrentPlanCard totalUsage={totalUsage} />
          )}
        />
      </div>
    </>
  );
}
