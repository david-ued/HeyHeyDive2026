-- HeyHeyDive — site_settings (single-row config table)
-- Stores SEO defaults (title / description / favicon) editable from /admin/settings.

create table if not exists public.site_settings (
  id text primary key default 'default',
  meta_title text,
  meta_title_en text,
  meta_description text,
  meta_description_en text,
  favicon_url text,
  og_image_url text,
  updated_at timestamptz not null default now(),
  constraint site_settings_single_row check (id = 'default')
);

insert into public.site_settings (id) values ('default')
  on conflict (id) do nothing;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read" on public.site_settings for select
  using (true);

drop policy if exists "site_settings admin write" on public.site_settings;
create policy "site_settings admin write" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());
