-- ARTHA Supabase schema
-- Run this file in Supabase SQL Editor after creating your project.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default 'ARTHA User',
  role text not null default 'viewer' check (role in ('admin', 'analyst', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsorship_deals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  club_name text not null,
  sponsor_name text not null,
  deal_value numeric(14,2) not null check (deal_value > 0),
  duration_months integer not null check (duration_months > 0),
  audience integer not null check (audience > 0),
  engagement integer not null check (engagement > 0),
  media_value numeric(14,2) not null check (media_value > 0),
  brand_exposure numeric(5,2) not null default 55 check (brand_exposure between 0 and 100),
  brand_share numeric(5,2) not null default 45 check (brand_share between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_data (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  revenue_per_user numeric(10,2) not null check (revenue_per_user >= 0),
  retention_rate numeric(5,2) not null check (retention_rate between 0 and 100),
  cac numeric(10,2) not null check (cac >= 0),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists deals_set_updated_at on public.sponsorship_deals;
create trigger deals_set_updated_at
before update on public.sponsorship_deals
for each row execute function public.set_updated_at();

create or replace function public.current_app_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'viewer'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.sponsorship_deals enable row level security;
alter table public.analytics_data enable row level security;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users for select
to authenticated
using (id = auth.uid() or public.current_app_role() = 'admin');

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
on public.users for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users for update
to authenticated
using (id = auth.uid() or public.current_app_role() = 'admin')
with check (
  public.current_app_role() = 'admin'
  or (id = auth.uid() and role = public.current_app_role())
);

drop policy if exists "Deals are readable by authenticated users" on public.sponsorship_deals;
create policy "Deals are readable by authenticated users"
on public.sponsorship_deals for select
to authenticated
using (true);

drop policy if exists "Admins and analysts can create deals" on public.sponsorship_deals;
create policy "Admins and analysts can create deals"
on public.sponsorship_deals for insert
to authenticated
with check (
  owner_id = auth.uid()
  and public.current_app_role() in ('admin', 'analyst')
);

drop policy if exists "Admins and analysts can update deals" on public.sponsorship_deals;
create policy "Admins and analysts can update deals"
on public.sponsorship_deals for update
to authenticated
using (public.current_app_role() in ('admin', 'analyst'))
with check (public.current_app_role() in ('admin', 'analyst'));

drop policy if exists "Admins can delete deals" on public.sponsorship_deals;
create policy "Admins can delete deals"
on public.sponsorship_deals for delete
to authenticated
using (public.current_app_role() = 'admin');

drop policy if exists "Analytics readable by authenticated users" on public.analytics_data;
create policy "Analytics readable by authenticated users"
on public.analytics_data for select
to authenticated
using (true);

drop policy if exists "Admins and analysts can create analytics" on public.analytics_data;
create policy "Admins and analysts can create analytics"
on public.analytics_data for insert
to authenticated
with check (
  owner_id = auth.uid()
  and public.current_app_role() in ('admin', 'analyst')
);

create index if not exists sponsorship_deals_created_at_idx
  on public.sponsorship_deals (created_at desc);

create index if not exists sponsorship_deals_club_sponsor_idx
  on public.sponsorship_deals (club_name, sponsor_name);

create index if not exists analytics_data_created_at_idx
  on public.analytics_data (created_at);

alter publication supabase_realtime add table public.sponsorship_deals;
alter publication supabase_realtime add table public.analytics_data;
