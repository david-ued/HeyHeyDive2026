-- HeyHeyDive CMS — seed the three CMS tables with the data currently rendered
-- on the public marketing site (extracted from src/messages/*.json).
--
-- Idempotent: re-running upserts on slug.

-- ─────────────────────────────────────────────────────────────
-- trips (4)  — see src/components/marketing/sections/seasonal-trips.tsx
-- ─────────────────────────────────────────────────────────────
insert into public.trips
  (slug, title, title_en, destination, kind, start_date, end_date,
   price_twd, capacity, available_seats, short_description, status)
values
  ('ludao-4d3n',  '綠島 4D3N 海底溫泉',  'Ludao 4D3N — Hot-spring dive',
   'ludao',  'padi', '2026-07-04', '2026-07-07', 18800, 10, 5,  '綠島南寮 · 4天3夜 · 8 支氣瓶 · 6 個潛點', 'open'),
  ('lanyu-5d4n',  '蘭嶼 5D4N 大物迴游',  'Lanyu 5D4N — Pelagic week',
   'lanyu',  'aida', '2026-07-18', '2026-07-22', 24500,  8, 3,  '蘭嶼開元港 · 5天4夜 · 12 支氣瓶 · 8 個潛點', 'open'),
  ('liuqiu-2d1n', '小琉球 2D1N 海龜行', 'Liuqiu 2D1N — Turtle escape',
   'liuqiu', 'padi', '2026-08-01', '2026-08-02',  6800, 15, 15, '小琉球白沙港 · 2天1夜 · 3 支氣瓶 · 3 個潛點', 'open'),
  ('kenting-3d2n','墾丁 3D2N 後壁湖',  'Kenting 3D2N — Houbihu',
   'kenting','padi', '2026-08-15', '2026-08-17',  9800, 12, 12, '後壁湖 · 3天2夜 · 6 支氣瓶 · 4 個潛點', 'draft')
on conflict (slug) do update set
  title             = excluded.title,
  title_en          = excluded.title_en,
  destination       = excluded.destination,
  kind              = excluded.kind,
  start_date        = excluded.start_date,
  end_date          = excluded.end_date,
  price_twd         = excluded.price_twd,
  capacity          = excluded.capacity,
  available_seats   = excluded.available_seats,
  short_description = excluded.short_description,
  status            = excluded.status;

-- ─────────────────────────────────────────────────────────────
-- dive_sites (3)  — src/components/marketing/sections/dive-site-cards.tsx
-- ─────────────────────────────────────────────────────────────
insert into public.dive_sites
  (slug, name, name_en, region, temp, visibility, intro, intro_en, display_order, status)
values
  ('ludao',  '綠島',   'Ludao',   '台東·綠島',  '26–28°C', '20–30m',
   '東部火山島嶼，世界三大海底溫泉之一。海流穩定、能見度高、地形多元，是台灣潛水人不能錯過的據點。',
   'A volcanic island on Taiwan''s east coast and one of only three undersea hot-spring sites on Earth. Steady currents, high visibility, varied topography.',
   0, 'open'),
  ('liuqiu', '小琉球', 'Liuqiu',  '屏東·琉球',  '24–28°C', '15–25m',
   '台灣唯一的珊瑚礁島，全年水溫穩定、地形平緩。一年四季都遇得到海龜，潛水入門的最佳起點。',
   'Taiwan''s only coral-reef island. Steady warm water, gentle topography, and near-guaranteed turtle sightings year-round.',
   1, 'open'),
  ('lanyu',  '蘭嶼',   'Lanyu',   '台東·蘭嶼',  '25–28°C', '20–35m',
   '達悟族的故鄉，黑潮湧升流帶來豐富生態。藍洞、垂直壁、迴游大物——挑戰你對潛水的想像。',
   'Home of the Tao people. Kuroshio upwelling fuels a wild marine ecosystem — blue caves, vertical walls, and pelagic giants.',
   2, 'open')
on conflict (slug) do update set
  name          = excluded.name,
  name_en       = excluded.name_en,
  region        = excluded.region,
  temp          = excluded.temp,
  visibility    = excluded.visibility,
  intro         = excluded.intro,
  intro_en      = excluded.intro_en,
  display_order = excluded.display_order,
  status        = excluded.status;

-- ─────────────────────────────────────────────────────────────
-- courses (2)  — src/components/marketing/sections/dual-courses.tsx
-- ─────────────────────────────────────────────────────────────
insert into public.courses
  (slug, system, level, title, title_en, duration, group_size, prerequisite,
   price_twd, description, description_en, status)
values
  ('aida', 'aida', 'AIDA2',
   'AIDA 2 自由潛水', 'AIDA 2 Freediver',
   '3 天', '1 教練 : 4 學員', '12 歲以上 · 會游泳',
   12800,
   '從一口氣的入門到 40 米深潛，AIDA 國際認證系統，循序漸進的呼吸與下潛訓練。',
   'From your first held breath to 40 m depth — internationally recognised AIDA certification, taught progressively.',
   'open'),
  ('padi', 'padi', 'OWD',
   'PADI OWD 開放水域潛水員', 'PADI Open Water Diver',
   '3-4 天', '1 教練 : 4 學員', '10 歲以上 · 會游泳',
   14800,
   'OWD 開放水域到 Rescue 救援潛水員，PADI 全球通用證照，從零基礎到專業潛員。',
   'From Open Water to Rescue Diver — globally portable PADI certification, from beginner to pro.',
   'open')
on conflict (slug) do update set
  system         = excluded.system,
  level          = excluded.level,
  title          = excluded.title,
  title_en       = excluded.title_en,
  duration       = excluded.duration,
  group_size     = excluded.group_size,
  prerequisite   = excluded.prerequisite,
  price_twd      = excluded.price_twd,
  description    = excluded.description,
  description_en = excluded.description_en,
  status         = excluded.status;
