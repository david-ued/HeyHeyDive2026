-- HeyHeyDive CMS — round 2
-- • JSONB content_zh / content_en on the three content tables (deep content)
-- • bookings table for public sign-ups (admin-only read, service-role insert)
-- • Storage bucket `covers` for cover images, public read

-- ─────────────────────────────────────────────────────────────
-- deep-content JSONB columns
-- ─────────────────────────────────────────────────────────────
alter table public.trips      add column if not exists content_zh jsonb;
alter table public.trips      add column if not exists content_en jsonb;

alter table public.dive_sites add column if not exists content_zh jsonb;
alter table public.dive_sites add column if not exists content_en jsonb;

alter table public.courses    add column if not exists content_zh jsonb;
alter table public.courses    add column if not exists content_en jsonb;

-- ─────────────────────────────────────────────────────────────
-- bookings
-- ─────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('trip','course')),
  item_id uuid not null,
  item_slug text not null,
  item_title_snapshot text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  contact_line text,
  party_size integer not null default 1 check (party_size between 1 and 99),
  notes text,
  status text not null default 'pending'
    check (status in ('pending','contacted','confirmed','cancelled')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_status_idx     on public.bookings (status);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_item_idx       on public.bookings (item_type, item_id);

drop trigger if exists bookings_touch on public.bookings;
create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

alter table public.bookings enable row level security;

-- Admins can do anything with bookings. Public has NO direct access — server
-- actions insert via the service-role client, bypassing RLS.
drop policy if exists "bookings admin all" on public.bookings;
create policy "bookings admin all" on public.bookings for all
  using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Storage bucket `covers` — public read, server-side uploads
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do update set public = true;

-- Public read policy. Writes happen via service-role, which bypasses RLS, so
-- we don't need an explicit write policy on storage.objects.
drop policy if exists "covers public read" on storage.objects;
create policy "covers public read" on storage.objects for select
  using (bucket_id = 'covers');
