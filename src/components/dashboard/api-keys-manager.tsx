"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import { getApiError, parseJsonResponse } from "@/lib/api-client";
import { MAX_ACTIVE_API_KEYS } from "@/lib/api-key-limits";
import type { ApiKey, ApiKeyPublic, ApiKeyType } from "@/types/api-key";

type ModalMode = "create" | "edit" | null;
type ToastType = ToastVariant;
type ToastState = { message: string; type: ToastType } | null;

const REVEALED_KEYS_STORAGE = "api-keys-revealed";

type ApiKeysManagerProps = {
  renderPlan?: (totalUsage: number) => React.ReactNode;
};

export function ApiKeysManager({ renderPlan }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState<ApiKeyPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingKey, setEditingKey] = useState<ApiKeyPublic | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<ApiKeyType>("dev");
  const [submitting, setSubmitting] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKey | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string>>({});

  const totalUsage = useMemo(
    () => keys.reduce((sum, key) => sum + key.usage, 0),
    [keys],
  );

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(REVEALED_KEYS_STORAGE);
      if (stored) setRevealedKeys(JSON.parse(stored) as Record<string, string>);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/api-keys");
      if (!response.ok) throw new Error(await getApiError(response));
      setKeys(await parseJsonResponse<ApiKeyPublic[]>(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchKeys();
  }, [fetchKeys]);

  function showToast(message: string, toastType: ToastType = "success") {
    setToast({ message, type: toastType });
  }

  function saveRevealedKey(id: string, key: string) {
    const next = { ...revealedKeys, [id]: key };
    setRevealedKeys(next);
    sessionStorage.setItem(REVEALED_KEYS_STORAGE, JSON.stringify(next));
  }

  const isAtKeyLimit = keys.length >= MAX_ACTIVE_API_KEYS;

  function showLimitWarning() {
    showToast(
      `Active key limit reached (${MAX_ACTIVE_API_KEYS}). Delete a key to create a new one.`,
      "warning",
    );
  }

  function openCreateModal() {
    if (isAtKeyLimit) {
      showLimitWarning();
      return;
    }

    setModalMode("create");
    setEditingKey(null);
    setName("");
    setType("dev");
    setNewlyCreatedKey(null);
  }

  function openEditModal(key: ApiKeyPublic) {
    setModalMode("edit");
    setEditingKey(key);
    setName(key.name);
    setType(key.type);
    setNewlyCreatedKey(null);
  }

  function closeModal() {
    setModalMode(null);
    setEditingKey(null);
    setName("");
    setType("dev");
    setNewlyCreatedKey(null);
  }

  function toggleReveal(id: string) {
    const fullKey = revealedKeys[id];
    if (!fullKey) {
      showToast("Full key only available for keys created this session", "error");
      return;
    }

    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function getDisplayKey(key: ApiKeyPublic) {
    const full = revealedKeys[key.id];
    if (revealedIds.has(key.id) && full) return full;
    return key.keyPreview;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      if (modalMode === "create") {
        const response = await fetch("/api/api-keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type }),
        });

        if (!response.ok) {
          const message = await getApiError(response);
          if (response.status === 429) {
            showLimitWarning();
            closeModal();
            return;
          }
          throw new Error(message);
        }

        const created = await parseJsonResponse<ApiKey>(response);
        saveRevealedKey(created.id, created.key);
        setRevealedIds((prev) => new Set(prev).add(created.id));
        setNewlyCreatedKey(created);
        await fetchKeys();
        return;
      }

      if (modalMode === "edit" && editingKey) {
        const response = await fetch(`/api/api-keys/${editingKey.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type }),
        });

        if (!response.ok) throw new Error(await getApiError(response));

        closeModal();
        await fetchKeys();
        showToast(`"${name.trim()}" updated successfully!`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const keyToDelete = keys.find((key) => key.id === id);
    if (!confirm("Delete this API key? This action cannot be undone.")) return;

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await getApiError(response));

      const nextRevealed = { ...revealedKeys };
      delete nextRevealed[id];
      setRevealedKeys(nextRevealed);
      sessionStorage.setItem(REVEALED_KEYS_STORAGE, JSON.stringify(nextRevealed));

      await fetchKeys();
      showToast(
        keyToDelete
          ? `"${keyToDelete.name}" deleted successfully!`
          : "API key deleted successfully!",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  async function copyKey(key: ApiKeyPublic) {
    const full = revealedKeys[key.id];
    const text = full ?? key.keyPreview;
    await navigator.clipboard.writeText(text);
    showToast(full ? "Full key copied" : "Key preview copied");
  }

  return (
    <div className="space-y-6">
      {renderPlan?.(totalUsage)}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* API Keys table card */}
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4 dark:border-stone-800 sm:px-5">
          <div>
            <h2 className="text-base font-semibold">API Keys</h2>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              {loading
                ? "Loading..."
                : `${keys.length} / ${MAX_ACTIVE_API_KEYS} active keys`}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            disabled={isAtKeyLimit}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:hover:bg-orange-950/30"
            title={
              isAtKeyLimit
                ? `Limit of ${MAX_ACTIVE_API_KEYS} active keys reached`
                : "Create API key"
            }
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-lg" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm text-stone-500 dark:text-stone-400">No API keys yet.</p>
            <Button className="mt-4" size="sm" onClick={openCreateModal}>
              <PlusIcon className="h-3.5 w-3.5" />
              Create your first key
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="divide-y divide-stone-200 dark:divide-stone-800 md:hidden">
              {keys.map((key) => (
                <div key={key.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{key.name}</p>
                      <code className="mt-1 block truncate font-mono text-xs text-stone-500">
                        {getDisplayKey(key)}
                      </code>
                    </div>
                    <TypeBadge type={key.type} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Usage: {key.usage}</span>
                    <div className="flex gap-1">
                      <IconButton title="Copy" onClick={() => copyKey(key)}>
                        <CopyIcon className="h-4 w-4" />
                      </IconButton>
                      <IconButton title="Edit" onClick={() => openEditModal(key)}>
                        <EditIcon className="h-4 w-4" />
                      </IconButton>
                      <IconButton title="Delete" onClick={() => handleDelete(key.id)} danger>
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-medium uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:text-stone-400">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Usage</th>
                    <th className="px-5 py-3">Key</th>
                    <th className="px-5 py-3 text-right">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr
                      key={key.id}
                      className="border-b border-stone-100 transition-colors last:border-0 hover:bg-orange-50/50 dark:border-stone-800 dark:hover:bg-orange-950/20"
                    >
                      <td className="px-5 py-4 font-medium">{key.name}</td>
                      <td className="px-5 py-4">
                        <TypeBadge type={key.type} />
                      </td>
                      <td className="px-5 py-4 text-stone-500 dark:text-stone-400">{key.usage}</td>
                      <td className="max-w-[220px] px-5 py-4">
                        <code className="block truncate rounded-md bg-stone-100 px-2.5 py-1 font-mono text-xs dark:bg-stone-800">
                          {getDisplayKey(key)}
                        </code>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            title={revealedIds.has(key.id) ? "Hide key" : "Show key"}
                            onClick={() => toggleReveal(key.id)}
                            disabled={!revealedKeys[key.id]}
                          >
                            {revealedIds.has(key.id) ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </IconButton>
                          <IconButton title="Copy key" onClick={() => copyKey(key)}>
                            <CopyIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton title="Edit key" onClick={() => openEditModal(key)}>
                            <EditIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            title="Delete key"
                            onClick={() => handleDelete(key.id)}
                            disabled={deletingId === key.id}
                            danger
                          >
                            {deletingId === key.id ? (
                              <SpinnerIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Modal */}
      {modalMode && (
        <div className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="animate-scale-in w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-900">
            <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400" />
            <div className="p-6">
              {newlyCreatedKey ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">API key created</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Copy your key now. You won&apos;t be able to see the full key
                    again after closing.
                  </p>
                  <code className="block break-all rounded-lg bg-orange-50 p-3 font-mono text-sm dark:bg-orange-950/30">
                    {newlyCreatedKey.key}
                  </code>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        await navigator.clipboard.writeText(newlyCreatedKey.key);
                        showToast("Copied to clipboard");
                      }}
                    >
                      Copy
                    </Button>
                    <Button
                      onClick={() => {
                        showToast(`"${newlyCreatedKey.name}" created successfully!`);
                        closeModal();
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-semibold">
                    {modalMode === "create" ? "Create API Key" : "Edit API Key"}
                  </h2>
                  <div>
                    <label htmlFor="key-name" className="mb-1.5 block text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="key-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. default"
                      autoFocus
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="key-type" className="mb-1.5 block text-sm font-medium">
                      Type
                    </label>
                    <select
                      id="key-type"
                      value={type}
                      onChange={(e) => setType(e.target.value as ApiKeyType)}
                      className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:border-orange-500 dark:focus:ring-orange-900/50"
                    >
                      <option value="dev">dev</option>
                      <option value="prod">prod</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={closeModal} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting || !name.trim()}>
                      {submitting ? "Saving..." : modalMode === "create" ? "Create" : "Save"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: ApiKeyPublic["type"] }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
        type === "prod"
          ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
          : "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400"
      }`}
    >
      {type}
    </span>
  );
}

function IconButton({
  children,
  onClick,
  title,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md p-1.5 transition-colors disabled:opacity-40 ${
        danger
          ? "text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          : "text-stone-400 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/30 dark:hover:text-orange-400"
      }`}
    >
      {children}
    </button>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
