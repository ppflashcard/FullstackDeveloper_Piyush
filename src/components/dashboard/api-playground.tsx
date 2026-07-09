"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import { getApiError, parseJsonResponse } from "@/lib/api-client";

type ToastState = { message: string; type: ToastVariant } | null;

type VerifyResponse = {
  valid: boolean;
  name?: string;
  message?: string;
  error?: string;
};

export function ApiPlayground() {
  const [apiKey, setApiKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (!apiKey.trim()) return;

    setSubmitting(true);
    setToast(null);

    try {
      const response = await fetch("/api/api-keys/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: apiKey.trim() }),
      });

      if (response.ok) {
        const data = await parseJsonResponse<VerifyResponse>(response);
        setToast({
          type: "success",
          message: data.name
            ? `Key is valid! Found "${data.name}" in the database.`
            : "Key is valid and present in the database.",
        });
        return;
      }

      const message = await getApiError(response);
      setToast({
        type: "error",
        message:
          response.status === 404
            ? "Key is invalid and not found in the database."
            : message,
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
            <h2 className="text-base font-semibold">Verify API Key</h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Enter your API key below to check if it exists in the database.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5 p-5 sm:p-6">
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
                Paste the full key you received when the key was created.
              </p>
            </div>

            <Button type="submit" disabled={submitting || !apiKey.trim()} className="w-full sm:w-auto">
              {submitting ? "Verifying..." : "Verify Key"}
            </Button>
          </form>
        </section>

        <div className="mt-6 rounded-xl border border-dashed border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-400">
          Keys are checked against your Supabase <code className="text-orange-600 dark:text-orange-400">api_keys</code> table.
          Invalid or deleted keys will not pass verification.
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
