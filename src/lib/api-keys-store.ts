import { randomBytes } from "crypto";
import {
  ApiKeyLimitError,
  ApiUsageLimitError,
  MAX_ACTIVE_API_KEYS,
  PLAN_CREDITS,
} from "@/lib/api-key-limits";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { ApiKey, ApiKeyPublic, CreateApiKeyInput, UpdateApiKeyInput } from "@/types/api-key";

type ApiKeyRow = {
  id: string;
  name: string;
  value: string;
  usage: number;
  created_at: string;
  user_id?: string | null;
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

  if (error.message.includes("user_id")) {
    throw new Error(
      "Database is missing the user_id column. Run supabase/migrations/003_api_keys_user_id.sql in the Supabase SQL Editor.",
    );
  }

  throw new Error(`Database error while trying to ${action}: ${error.message}`);
}

const API_KEY_COLUMNS = "id, name, value, usage, created_at, user_id";

export async function countActiveApiKeys(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { count, error } = await supabase
    .from("api_keys")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) handleDbError(error, "count API keys");

  return count ?? 0;
}

export async function listApiKeys(userId: string): Promise<ApiKeyPublic[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("api_keys")
    .select(API_KEY_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) handleDbError(error, "list API keys");

  return (data ?? []).map((row) => toPublic(rowToApiKey(row as ApiKeyRow)));
}

export async function getApiKey(
  id: string,
  userId: string,
): Promise<ApiKeyPublic | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("api_keys")
    .select(API_KEY_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) handleDbError(error, "get API key");
  if (!data) return null;

  return toPublic(rowToApiKey(data as ApiKeyRow));
}

export async function createApiKey(
  input: CreateApiKeyInput,
  userId: string,
): Promise<ApiKey> {
  const activeCount = await countActiveApiKeys(userId);
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
      user_id: userId,
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
  userId: string,
): Promise<ApiKeyPublic | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("api_keys")
    .update({ name: input.name.trim() })
    .eq("id", id)
    .eq("user_id", userId)
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

export async function deleteApiKey(id: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) handleDbError(error, "delete API key");

  return Boolean(data);
}

export async function verifyApiKeyByValue(
  key: string,
): Promise<{ valid: true; name: string; userId: string | null } | { valid: false }> {
  const supabase = getSupabaseAdmin();
  const trimmed = key.trim();

  if (!trimmed) {
    return { valid: false };
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("name, user_id")
    .eq("value", trimmed)
    .maybeSingle();

  if (error) handleDbError(error, "verify API key");

  if (!data) {
    return { valid: false };
  }

  return {
    valid: true,
    name: data.name,
    userId: (data.user_id as string | null) ?? null,
  };
}

export function extractApiKeyFromRequest(request: Request): string | null {
  const headerKey = request.headers.get("x-api-key")?.trim();
  if (headerKey) return headerKey;

  const authHeader = request.headers.get("authorization")?.trim();
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  return null;
}

export async function getTotalApiUsage(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("api_keys")
    .select("usage")
    .eq("user_id", userId);

  if (error) handleDbError(error, "get total API usage");

  return (data ?? []).reduce((sum, row) => sum + (Number(row.usage) || 0), 0);
}

export async function assertCanMakeApiCallout(userId: string): Promise<void> {
  const totalUsage = await getTotalApiUsage(userId);

  if (totalUsage >= PLAN_CREDITS) {
    throw new ApiUsageLimitError(totalUsage);
  }
}

export async function incrementApiKeyUsage(key: string): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  const trimmed = key.trim();

  const { data: existing, error: fetchError } = await supabase
    .from("api_keys")
    .select("id, usage")
    .eq("value", trimmed)
    .maybeSingle();

  if (fetchError) handleDbError(fetchError, "fetch API key usage");
  if (!existing) return null;

  const newUsage = (Number(existing.usage) || 0) + 1;

  const { error: updateError } = await supabase
    .from("api_keys")
    .update({ usage: newUsage })
    .eq("id", existing.id);

  if (updateError) handleDbError(updateError, "increment API key usage");

  return newUsage;
}
