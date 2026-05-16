-- HeyHeyDive CMS — initial schema
-- Tables: trips, dive_sites, courses
-- Auth model: admin = auth.users.raw_app_meta_data->>'role' = 'admin'

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- helper: is current user admin?
-- ─────────────────────────────────────────────────────────────
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (auth.jwt()->'app_metadata'->>'role') = 'admin',
    false
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- trips
-- ─────────────────────────────────────────────────────────────
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  title_en text,
  destination text not null check (destination in ('ludao','lanyu','liuqiu','kenting','other')),
  kind text not null default 'padi' check (kind in ('padi','aida','experience','other')),
  start_date date not null,
  end_date date not null,
  price_twd integer not null default 0,
  capacity integer not null default 10,
  available_seats integer not null default 10,
  short_description text,
  description text,
  description_en text,
  cover_image text,
  status text not null default 'open' check (status in ('open','sold_out','closed','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists trips_start_date_idx on public.trips (start_date);
create index if not exists trips_destination_idx on public.trips (destination);
create index if not exists trips_status_idx on public.trips (status);

-- ─────────────────────────────────────────────────────────────
-- dive_sites
-- ─────────────────────────────────────────────────────────────
create table if not exists public.dive_sites (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  name_en text,
  region text,
  temp text,
  visibility text,
  intro text,
  intro_en text,
  cover_image text,
  display_order integer not null default 0,
  status text not null default 'open' check (status in ('open','closed','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dive_sites_display_order_idx on public.dive_sites (display_order);

-- ─────────────────────────────────────────────────────────────
-- courses
-- ─────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  system text not null check (system in ('aida','padi','other')),
  level text not null,
  title text not null,
  title_en text,
  duration text,
  group_size text,
  prerequisite text,
  price_twd integer not null default 0,
  description text,
  description_en text,
  cover_image text,
  status text not null default 'open' check (status in ('open','closed','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- updated_at trigger
-- ─────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trips_touch on public.trips;
create trigger trips_touch before update on public.trips
  for each row execute function public.touch_updated_at();

drop trigger if exists dive_sites_touch on public.dive_sites;
create trigger dive_sites_touch before update on public.dive_sites
  for each row execute function public.touch_updated_at();

drop trigger if exists courses_touch on public.courses;
create trigger courses_touch before update on public.courses
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- RLS — public reads non-draft rows, admin can do anything
-- ─────────────────────────────────────────────────────────────
alter table public.trips enable row level security;
alter table public.dive_sites enable row level security;
alter table public.courses enable row level security;

drop policy if exists "trips read non-draft" on public.trips;
create policy "trips read non-draft" on public.trips for select
  using (status <> 'draft' or public.is_admin());

drop policy if exists "trips admin write" on public.trips;
create policy "trips admin write" on public.trips for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "dive_sites read non-draft" on public.dive_sites;
create policy "dive_sites read non-draft" on public.dive_sites for select
  using (status <> 'draft' or public.is_admin());

drop policy if exists "dive_sites admin write" on public.dive_sites;
create policy "dive_sites admin write" on public.dive_sites for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "courses read non-draft" on public.courses;
create policy "courses read non-draft" on public.courses for select
  using (status <> 'draft' or public.is_admin());

drop policy if exists "courses admin write" on public.courses;
create policy "courses admin write" on public.courses for all
  using (public.is_admin()) with check (public.is_admin());
