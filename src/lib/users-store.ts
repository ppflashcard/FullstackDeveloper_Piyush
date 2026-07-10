import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type UserPlan = "free" | "pro" | "custom";

export type AppUser = {
  id: string;
  email: string;
  password_hash: string | null;
  name: string | null;
  plan: UserPlan;
  auth_provider: "credentials" | "google";
  card_name: string | null;
  card_number: string | null;
  card_expiry: string | null;
  card_cvc: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateUserInput = {
  email: string;
  password?: string;
  name?: string;
  plan?: UserPlan;
  authProvider?: "credentials" | "google";
  id?: string;
  cardName?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
};

function mapRow(row: Record<string, unknown>): AppUser {
  return {
    id: String(row.id),
    email: String(row.email),
    password_hash: (row.password_hash as string | null) ?? null,
    name: (row.name as string | null) ?? null,
    plan: (row.plan as UserPlan) ?? "free",
    auth_provider: (row.auth_provider as "credentials" | "google") ?? "credentials",
    card_name: (row.card_name as string | null) ?? null,
    card_number: (row.card_number as string | null) ?? null,
    card_expiry: (row.card_expiry as string | null) ?? null,
    card_cvc: (row.card_cvc as string | null) ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRow(data) : null;
}

export async function findUserById(id: string): Promise<AppUser | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRow(data) : null;
}

export async function createUser(input: CreateUserInput): Promise<AppUser> {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = input.password
    ? await bcrypt.hash(input.password, 10)
    : null;

  const row = {
    id: input.id ?? randomUUID(),
    email,
    password_hash: passwordHash,
    name: input.name?.trim() || null,
    plan: input.plan ?? "free",
    auth_provider: input.authProvider ?? "credentials",
    card_name: input.cardName?.trim() || null,
    card_number: input.cardNumber?.trim() || null,
    card_expiry: input.cardExpiry?.trim() || null,
    card_cvc: input.cardCvc?.trim() || null,
  };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data);
}

export async function upsertGoogleUser(input: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<AppUser> {
  const email = input.email.trim().toLowerCase();
  const existingById = await findUserById(input.id);
  if (existingById) {
    return existingById;
  }

  const existingByEmail = await findUserByEmail(email);
  if (existingByEmail) {
    return existingByEmail;
  }

  return createUser({
    id: input.id,
    email,
    name: input.name ?? undefined,
    plan: "free",
    authProvider: "google",
  });
}

export async function verifyPassword(
  user: AppUser,
  password: string,
): Promise<boolean> {
  if (!user.password_hash) return false;
  return bcrypt.compare(password, user.password_hash);
}
