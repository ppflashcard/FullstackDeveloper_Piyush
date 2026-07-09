-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  secret_key text not null unique,
  type text not null default 'dev' check (type in ('dev', 'prod')),
  usage integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists api_keys_created_at_idx
  on public.api_keys (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists api_keys_set_updated_at on public.api_keys;

create trigger api_keys_set_updated_at
before update on public.api_keys
for each row
execute function public.set_updated_at();

alter table public.api_keys enable row level security;

-- Server-side API routes use the service role key, which bypasses RLS.
-- These policies allow future client-side access if you add auth later.
create policy "Allow read for authenticated users"
  on public.api_keys
  for select
  to authenticated
  using (true);

create policy "Allow insert for authenticated users"
  on public.api_keys
  for insert
  to authenticated
  with check (true);

create policy "Allow update for authenticated users"
  on public.api_keys
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Allow delete for authenticated users"
  on public.api_keys
  for delete
  to authenticated
  using (true);
