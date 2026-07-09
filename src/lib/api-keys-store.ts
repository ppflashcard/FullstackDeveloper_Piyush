import { randomBytes } from "crypto";
import { ApiKeyLimitError, MAX_ACTIVE_API_KEYS } from "@/lib/api-key-limits";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { ApiKey, ApiKeyPublic, CreateApiKeyInput, UpdateApiKeyInput } from "@/types/api-key";

type ApiKeyRow = {
  id: string;
  name: string;
  value: string;
  usage: number;
  created_at: string;
};

function generateKey(): string {
  return `sk_${randomBytes(24).toString("hex")}`;
}

function rowToApiKey(row: ApiKeyRow): ApiKey {
  return {
    id: row.id,
    name: row.name,
    key: row.value,
    type: "dev",
    usage: Number(row.usage) || 0,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}

function toPublic(apiKey: ApiKey): ApiKeyPublic {
  const { key, ...rest } = apiKey;
  return {
    ...rest,
    keyPreview: `••••••••${key.slice(-4)}`,
  };
}

function handleDbError(error: { message: string }, action: string): never {
  console.error(`Supabase ${action} failed:`, error.message);
  throw new Error(`Database error while trying to ${action}`);
}

const API_KEY_COLUMNS = "id, name, value, usage, created_at";

export async function countActiveApiKeys(): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { count, error } = await supabase
    .from("api_keys")
    .select("*", { count: "exact", head: true });

  if (error) handleDbError(error, "count API keys");

  return count ?? 0;
}

export async function listApiKeys(): Promise<ApiKeyPublic[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("api_keys")
    .select(API_KEY_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) handleDbError(error, "list API keys");

  return (data ?? []).map((row) => toPublic(rowToApiKey(row as ApiKeyRow)));
}

export async function getApiKey(id: string): Promise<ApiKeyPublic | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("api_keys")
    .select(API_KEY_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) handleDbError(error, "get API key");
  if (!data) return null;

  return toPublic(rowToApiKey(data as ApiKeyRow));
}

export async function createApiKey(input: CreateApiKeyInput): Promise<ApiKey> {
  const activeCount = await countActiveApiKeys();
  if (activeCount >= MAX_ACTIVE_API_KEYS) {
    throw new ApiKeyLimitError();
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      name: input.name.trim(),
      value: generateKey(),
      usage: 0,
      created_at: now,
    })
    .select(API_KEY_COLUMNS)
    .single();

  if (error) handleDbError(error, "create API key");

  const apiKey = rowToApiKey(data as ApiKeyRow);
  return { ...apiKey, type: input.type === "prod" ? "prod" : "dev" };
}

export async function updateApiKey(
  id: string,
  input: UpdateApiKeyInput,
): Promise<ApiKeyPublic | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("api_keys")
    .update({ name: input.name.trim() })
    .eq("id", id)
    .select(API_KEY_COLUMNS)
    .maybeSingle();

  if (error) handleDbError(error, "update API key");
  if (!data) return null;

  const apiKey = rowToApiKey(data as ApiKeyRow);
  return toPublic({
    ...apiKey,
    type: input.type === "prod" ? "prod" : input.type === "dev" ? "dev" : apiKey.type,
  });
}

export async function deleteApiKey(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) handleDbError(error, "delete API key");

  return Boolean(data);
}

export async function verifyApiKeyByValue(
  key: string,
): Promise<{ valid: true; name: string } | { valid: false }> {
  const supabase = getSupabaseAdmin();
  const trimmed = key.trim();

  if (!trimmed) {
    return { valid: false };
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("name")
    .eq("value", trimmed)
    .maybeSingle();

  if (error) handleDbError(error, "verify API key");

  if (!data) {
    return { valid: false };
  }

  return { valid: true, name: data.name };
}
