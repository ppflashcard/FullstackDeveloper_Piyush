-- Run this in Supabase SQL Editor if you already created api_keys without secret_key

-- Option A: fresh start (deletes existing keys)
drop table if exists public.api_keys cascade;

-- Then re-run: supabase/migrations/001_api_keys.sql

-- Option B: add missing column to existing table (if table exists without secret_key)
-- alter table public.api_keys add column if not exists secret_key text unique;
