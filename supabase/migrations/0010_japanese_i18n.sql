-- HeyHeyDive — add Japanese (ja) trilingual columns.
-- zh-TW remains the canonical / default locale. Existing zh + *_en columns
-- stay; this migration only adds new *_ja text columns and content_ja JSONB
-- so the CMS and frontend can render Japanese without changing fallbacks.

-- ─── trips ──────────────────────────────────────────────────────────
alter table public.trips
  add column if not exists title_ja text,
  add column if not exists description_ja text,
  add column if not exists content_ja jsonb;

-- ─── dive_sites ─────────────────────────────────────────────────────
alter table public.dive_sites
  add column if not exists name_ja text,
  add column if not exists intro_ja text,
  add column if not exists content_ja jsonb;

-- ─── courses ────────────────────────────────────────────────────────
alter table public.courses
  add column if not exists title_ja text,
  add column if not exists description_ja text,
  add column if not exists content_ja jsonb;

-- ─── site_settings ──────────────────────────────────────────────────
alter table public.site_settings
  add column if not exists meta_title_ja text,
  add column if not exists meta_description_ja text;

-- ─── merch_products ────────────────────────────────────────────────
alter table public.merch_products
  add column if not exists name_ja text,
  add column if not exists description_ja text,
  add column if not exists content_ja jsonb;

-- ─── faq_categories ────────────────────────────────────────────────
alter table public.faq_categories
  add column if not exists title_ja text;

-- ─── faq_items ─────────────────────────────────────────────────────
alter table public.faq_items
  add column if not exists question_ja text,
  add column if not exists answer_ja text;
