"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import { getApiError, parseJsonResponse } from "@/lib/api-client";

type ToastState = { message: string; type: ToastVariant } | null;

type CatFactResponse = {
  fact: string;
  length: number;
  keyName?: string;
  usage?: number;
  error?: string;
};

export function ApiPlayground() {
  const [apiKey, setApiKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [result, setResult] = useState<CatFactResponse | null>(null);

  async function handleFetch(event: React.FormEvent) {
    event.preventDefault();
    if (!apiKey.trim()) {
      setToast({
        type: "error",
        message:
          "API key is empty. Paste your full sk_... key from the dashboard Overview page.",
      });
      return;
    }

    setSubmitting(true);
    setToast(null);
    setResult(null);

    try {
      const response = await fetch("/api/cat-facts", {
        headers: { "x-api-key": apiKey.trim() },
      });

      if (response.ok) {
        const data = await parseJsonResponse<CatFactResponse>(response);
        setResult(data);
        setToast({
          type: "success",
          message: data.usage
            ? `Cat fact fetched! Usage is now ${data.usage}. Refresh Overview to see updated credits.`
            : "Cat fact fetched successfully!",
        });
        return;
      }

      const message = await getApiError(response);
      setToast({
        type: "error",
        message,
      });
    } catch {
      setToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="shrink-0 border-b border-stone-200 bg-white px-4 py-4 dark:border-stone-800 dark:bg-stone-900 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Pages / <span className="text-stone-900 dark:text-stone-100">API Playground</span>
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">API Playground</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800 sm:px-6">
            <h2 className="text-base font-semibold">Fetch Cat Fact</h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Send your API key as a header to proxy a request to catfact.ninja. Each
              successful call increments your key&apos;s usage.
            </p>
          </div>

          <form onSubmit={handleFetch} className="space-y-5 p-5 sm:p-6">
            <div>
              <label htmlFor="playground-key" className="mb-1.5 block text-sm font-medium">
                API Key
              </label>
              <Input
                id="playground-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                autoComplete="off"
                required
              />
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Sent as <code className="text-orange-600 dark:text-orange-400">x-api-key</code> header.
              </p>
            </div>

            <Button type="submit" disabled={submitting || !apiKey.trim()} className="w-full sm:w-auto">
              {submitting ? "Fetching..." : "Get Cat Fact"}
            </Button>
          </form>

          {result?.fact ? (
            <div className="border-t border-stone-200 px-5 py-4 dark:border-stone-800 sm:px-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Response
              </p>
              <blockquote className="rounded-xl bg-orange-50 px-4 py-3 text-sm italic text-stone-800 dark:bg-orange-950/30 dark:text-stone-200">
                &ldquo;{result.fact}&rdquo;
              </blockquote>
              {result.usage != null ? (
                <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                  Key: {result.keyName ?? "—"} · Usage: {result.usage}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <div className="mt-6 rounded-xl border border-dashed border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-400">
          Proxies to{" "}
          <code className="text-orange-600 dark:text-orange-400">https://catfact.ninja/fact</code>.
          Missing keys return 401, invalid keys return 401, and exhausted plan credits return 429.
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
