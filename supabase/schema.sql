-- =============================================================================
-- NOCASH Panel — Supabase schema
-- Run this entire file in the Supabase SQL editor (Dashboard → SQL → New query).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  fullname text,
  level int not null default 2,             -- 1 = admin, 2 = reseller
  saldo numeric(14, 2) not null default 0,
  status int not null default 1,            -- 1 = active, 0 = disabled
  uplink text,                              -- username of the referrer
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  set_saldo numeric(14, 2) not null default 0,
  used_by text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.keys_code (
  id bigint generated always as identity primary key,
  game text not null,
  user_key text not null unique,
  duration int not null default 24,         -- duration in hours
  expired_date timestamptz,
  max_devices int not null default 1,
  devices text,                             -- comma-separated device serials
  status int not null default 1,            -- 1 = active, 0 = inactive
  registrator text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.history (
  id bigint generated always as identity primary key,
  keys_id bigint,
  user_do text,
  info text,
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: is_admin() — reads profiles as security definer to avoid RLS
-- recursion while checking the caller's role.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and level = 1
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: auto-create a profile whenever an auth user is created (fallback).
-- The app also upserts the profile explicitly during registration.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, fullname, level, saldo, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || replace(new.id::text, '-', '')),
    null,
    2,
    0,
    1
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.referral_codes enable row level security;
alter table public.keys_code enable row level security;
alter table public.history enable row level security;
alter table public.app_settings enable row level security;

-- profiles
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_delete" on public.profiles;
create policy "profiles_delete" on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- referral_codes (admin only)
drop policy if exists "referral_select" on public.referral_codes;
create policy "referral_select" on public.referral_codes
  for select to authenticated using (public.is_admin());

drop policy if exists "referral_insert" on public.referral_codes;
create policy "referral_insert" on public.referral_codes
  for insert to authenticated with check (public.is_admin());

drop policy if exists "referral_update" on public.referral_codes;
create policy "referral_update" on public.referral_codes
  for update to authenticated using (public.is_admin());

drop policy if exists "referral_delete" on public.referral_codes;
create policy "referral_delete" on public.referral_codes
  for delete to authenticated using (public.is_admin());

-- keys_code (owner = registrator username, or admin)
drop policy if exists "keys_select" on public.keys_code;
create policy "keys_select" on public.keys_code
  for select to authenticated
  using (
    registrator = (select username from public.profiles where id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "keys_insert" on public.keys_code;
create policy "keys_insert" on public.keys_code
  for insert to authenticated
  with check (
    registrator = (select username from public.profiles where id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "keys_update" on public.keys_code;
create policy "keys_update" on public.keys_code
  for update to authenticated
  using (
    registrator = (select username from public.profiles where id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "keys_delete" on public.keys_code;
create policy "keys_delete" on public.keys_code
  for delete to authenticated
  using (
    registrator = (select username from public.profiles where id = auth.uid())
    or public.is_admin()
  );

-- history
drop policy if exists "history_select" on public.history;
create policy "history_select" on public.history
  for select to authenticated
  using (
    user_do = (select username from public.profiles where id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "history_insert" on public.history;
create policy "history_insert" on public.history
  for insert to authenticated
  with check (
    user_do = (select username from public.profiles where id = auth.uid())
    or public.is_admin()
  );

-- app_settings
drop policy if exists "settings_select" on public.app_settings;
create policy "settings_select" on public.app_settings
  for select to authenticated using (true);

drop policy if exists "settings_insert" on public.app_settings;
create policy "settings_insert" on public.app_settings
  for insert to authenticated with check (public.is_admin());

drop policy if exists "settings_update" on public.app_settings;
create policy "settings_update" on public.app_settings
  for update to authenticated using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- Grants
-- ─────────────────────────────────────────────────────────────────────────────

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed data (server settings)
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.app_settings (key, value) values
  ('modname', '"NOCASH KURO PANEL"'),
  ('telegram', '"@NOCASH_xD"'),
  ('floating_text', '"@NOCASH_xD"'),
  ('floating_status', '"Safe"'),
  ('maintenance', 'false')
on conflict (key) do nothing;
