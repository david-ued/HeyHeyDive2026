-- HeyHeyDive — 限量周邊 (merch)
--
-- Display-only product catalog (no checkout). Admin uploads products via
-- /admin/merch; the public storefront /[locale]/merch shows a Shopify-style
-- grid and per-product detail page with "聯絡客服詢購" CTA only.
--
-- Schema mirrors the trips / courses tables for consistency:
--   • status filter excludes drafts on public reads via RLS
--   • is_admin() owns writes
--   • Two image columns:
--       cover_image  — single canonical image, shown on cards & top of detail
--       gallery      — text[] of additional shots for the detail-page gallery

create table if not exists public.merch_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  name_en text,
  category text not null default 'apparel'
    check (category in ('apparel','accessory','gear','print','other')),
  price_twd integer not null default 0,
  compare_at_price_twd integer,
  short_description text,
  description text,
  description_en text,
  cover_image text,
  gallery text[] not null default '{}',
  badge text,                       -- e.g. "限量"、"預購"、"新品"
  stock integer,                    -- nullable; null = no stock display
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  features text[] not null default '{}',
  display_order integer not null default 0,
  status text not null default 'draft'
    check (status in ('active','sold_out','draft','archived')),
  content_zh jsonb,
  content_en jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists merch_products_status_idx        on public.merch_products (status);
create index if not exists merch_products_category_idx      on public.merch_products (category);
create index if not exists merch_products_display_order_idx on public.merch_products (display_order);

drop trigger if exists merch_products_touch on public.merch_products;
create trigger merch_products_touch before update on public.merch_products
  for each row execute function public.touch_updated_at();

alter table public.merch_products enable row level security;

drop policy if exists "merch read non-draft" on public.merch_products;
create policy "merch read non-draft" on public.merch_products for select
  using (status not in ('draft','archived') or public.is_admin());

drop policy if exists "merch admin write" on public.merch_products;
create policy "merch admin write" on public.merch_products for all
  using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Seed 6 products with SVG cover art shipped in /public/images/merch.
-- Admins can later replace covers with real photos via /admin/merch.
-- ─────────────────────────────────────────────────────────────
insert into public.merch_products
  (slug, name, name_en, category, price_twd, compare_at_price_twd,
   short_description, description, description_en, cover_image, gallery,
   badge, stock, sizes, colors, features, display_order, status)
values
  (
    'tee-ocean-classic',
    '海洋藍經典 T-shirt',
    'Ocean Blue Classic Tee',
    'apparel',
    880, 1080,
    '純棉 220g 重磅 T，胸前刺繡 heyhey DIVE，雙面印花。',
    'S2 2026 限定。台灣製、220 GSM 環保純棉、領口採用無縫圓筒織法，下水亦不變形。胸前以金線立體刺繡 heyhey DIVE，背面為 DIVE TAIWAN 印刷標語。下水後請以清水手洗、陰乾。',
    'Made in Taiwan. 220 GSM organic cotton with embroidered chest logo and back print.',
    '/images/merch/tee-ocean.svg',
    ARRAY['/images/merch/tee-back.svg']::text[],
    '限量',
    24,
    ARRAY['S','M','L','XL']::text[],
    ARRAY['海洋藍','深海軍藍']::text[],
    ARRAY['220 GSM 重磅純棉','金線胸前刺繡','雙面印花','耐水洗']::text[],
    0, 'active'
  ),
  (
    'towel-coral-beach',
    '珊瑚色海灘巾',
    'Coral Beach Towel',
    'accessory',
    980, NULL,
    '長 150 cm 雙面雪尼爾棉，快乾不掉毛，下水後最舒服的同伴。',
    '雙面長纖維雪尼爾棉，吸水量是一般毛巾兩倍以上。150 × 75 cm 大尺寸，可當瑜伽墊、野餐墊或泳後披肩。色號為 HeyHey 標誌的珊瑚紅，搭配黃色窄條紋。',
    'Two-sided chenille cotton, 150 × 75 cm, ultra absorbent and quick-drying.',
    '/images/merch/towel-coral.svg',
    ARRAY[]::text[],
    '新品',
    18,
    ARRAY[]::text[],
    ARRAY['珊瑚橘']::text[],
    ARRAY['150 × 75 cm','雪尼爾棉','快乾不掉毛','可機洗']::text[],
    1, 'active'
  ),
  (
    'tote-canvas-natural',
    '帆布托特包',
    'Canvas Tote · Natural',
    'accessory',
    680, NULL,
    '14 oz 厚帆布、內裡防水塗層，潛旅日常一袋裝下。',
    '14 oz 重磅帆布外層 + PU 防水內裡，裝得下大毛巾、面鏡與防曬乳。胸口印「heyhey DIVE TAIWAN」字樣，下方一條珊瑚紅波浪線。雙織帶設計，肩背手提皆順手。',
    'Heavy 14 oz canvas with waterproof PU lining. Fits a full beach kit.',
    '/images/merch/tote-canvas.svg',
    ARRAY[]::text[],
    NULL,
    30,
    ARRAY[]::text[],
    ARRAY['原色']::text[],
    ARRAY['14 oz 厚帆布','PU 內裡防水','可肩背手提','約 38×42 cm']::text[],
    2, 'active'
  ),
  (
    'cap-navy-dad',
    '深海軍藍棒球帽',
    'Deep Navy Dad Cap',
    'apparel',
    580, NULL,
    '六片式低帽冠，刺繡 hh DIVE。長太陽、下深海都帶它。',
    '六片式 unstructured 帽冠，戴起來貼合不壓頭。深海軍藍底搭配金線「hh DIVE」前刺繡，後方為金屬扣帶可調。表布做防潑水處理，海邊風吹久一點也乾得快。',
    'Six-panel unstructured dad cap, water-repellent finish, embroidered front.',
    '/images/merch/cap-navy.svg',
    ARRAY[]::text[],
    NULL,
    24,
    ARRAY['F (54–60 cm 可調)']::text[],
    ARRAY['深海軍藍']::text[],
    ARRAY['六片式低帽冠','金線立體刺繡','防潑水表布','後方金屬扣可調']::text[],
    3, 'active'
  ),
  (
    'bottle-steel-600',
    'SEA Bottle 不鏽鋼保溫瓶 600ml',
    'SEA Bottle · Stainless 600ml',
    'gear',
    1080, NULL,
    '雙層 316 不鏽鋼，保冰 24h、保溫 12h。船上下水的最佳補給。',
    '316 食品級不鏽鋼真空雙層瓶身，無雙酚 A 內塗層。瓶身為海洋漸層藍，貼上 heyhey SEA BOTTLE 米色標籤。內附防漏矽膠墊，搖晃不滲水。',
    'Double-wall 316 stainless steel, ocean gradient finish, 600 ml.',
    '/images/merch/bottle-steel.svg',
    ARRAY[]::text[],
    '限量',
    12,
    ARRAY['600 ml']::text[],
    ARRAY['海洋漸層藍']::text[],
    ARRAY['316 食品級不鏽鋼','保冰 24h / 保溫 12h','防漏矽膠墊','BPA-free']::text[],
    4, 'active'
  ),
  (
    'stickers-set-04',
    '潛旅貼紙包（4 入）',
    'Sticker Set · 4 Pieces',
    'print',
    180, NULL,
    '4 入防水模切貼紙：海龜、波浪標、溫泉勳章、氣泡呼吸。',
    '日本進口霧面 PVC 防水模切貼紙，曬不黃、不褪色。4 入一包，分別為小琉球海龜（藍底）、heyhey DIVE 波浪標（珊瑚紅）、綠島海底溫泉勳章（金）、BREATHE 氣泡（藍）。',
    'Four matte vinyl die-cut stickers — turtle, wave, hot-spring badge, breathe bubble.',
    '/images/merch/stickers-pack.svg',
    ARRAY[]::text[],
    '新品',
    60,
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY['霧面 PVC 防水','模切設計','日曬不褪色','4 入一包']::text[],
    5, 'active'
  )
on conflict (slug) do update set
  name                  = excluded.name,
  name_en               = excluded.name_en,
  category              = excluded.category,
  price_twd             = excluded.price_twd,
  compare_at_price_twd  = excluded.compare_at_price_twd,
  short_description     = excluded.short_description,
  description           = excluded.description,
  description_en        = excluded.description_en,
  cover_image           = excluded.cover_image,
  gallery               = excluded.gallery,
  badge                 = excluded.badge,
  stock                 = excluded.stock,
  sizes                 = excluded.sizes,
  colors                = excluded.colors,
  features              = excluded.features,
  display_order         = excluded.display_order,
  status                = excluded.status;
