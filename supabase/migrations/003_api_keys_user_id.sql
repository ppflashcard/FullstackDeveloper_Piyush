-- Add per-user ownership for API keys (run in Supabase SQL Editor)

alter table public.api_keys
  add column if not exists user_id text;

create index if not exists api_keys_user_id_idx
  on public.api_keys (user_id);

-- Optional: remove orphan keys that have no owner after SSO rollout
-- delete from public.api_keys where user_id is null;
