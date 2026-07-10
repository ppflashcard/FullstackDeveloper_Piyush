-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id text primary key,
  email text not null unique,
  password_hash text,
  name text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'custom')),
  auth_provider text not null default 'credentials'
    check (auth_provider in ('credentials', 'google')),
  card_name text,
  card_number text,
  card_expiry text,
  card_cvc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

drop trigger if exists users_set_updated_at on public.users;

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

alter table public.users enable row level security;

create policy "Allow read for authenticated users"
  on public.users
  for select
  to authenticated
  using (true);

create policy "Allow insert for authenticated users"
  on public.users
  for insert
  to authenticated
  with check (true);

create policy "Allow update for authenticated users"
  on public.users
  for update
  to authenticated
  using (true)
  with check (true);
