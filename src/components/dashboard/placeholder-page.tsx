import Link from "next/link";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <header className="shrink-0 border-b border-stone-200 bg-white px-4 py-4 dark:border-stone-800 dark:bg-stone-900 sm:px-6 lg:px-8">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Pages / <span className="text-stone-900 dark:text-stone-100">{title}</span>
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl dark:bg-orange-950/40">
          🚧
        </div>
        <h2 className="text-lg font-semibold">Coming soon</h2>
        <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
          This section is under development. Head to Overview to manage your API keys.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          Go to Overview
        </Link>
      </div>
    </>
  );
}
