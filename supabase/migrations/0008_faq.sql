-- HeyHeyDive — 常見問題 (FAQ)
--
-- Two-table model: a small set of categories drives the tabs on /faq,
-- and items hang off each category. Admin manages both via /admin/faqs.
-- Public reads non-draft rows; writes are admin-only via is_admin().

create table if not exists public.faq_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  title_en text,
  kicker text,
  display_order integer not null default 0,
  status text not null default 'open' check (status in ('open','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faq_categories_display_order_idx on public.faq_categories (display_order);
create index if not exists faq_categories_status_idx        on public.faq_categories (status);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.faq_categories(id) on delete cascade,
  question text not null,
  question_en text,
  answer text not null,
  answer_en text,
  display_order integer not null default 0,
  status text not null default 'open' check (status in ('open','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faq_items_category_id_idx     on public.faq_items (category_id);
create index if not exists faq_items_display_order_idx   on public.faq_items (display_order);
create index if not exists faq_items_status_idx          on public.faq_items (status);

drop trigger if exists faq_categories_touch on public.faq_categories;
create trigger faq_categories_touch before update on public.faq_categories
  for each row execute function public.touch_updated_at();

drop trigger if exists faq_items_touch on public.faq_items;
create trigger faq_items_touch before update on public.faq_items
  for each row execute function public.touch_updated_at();

alter table public.faq_categories enable row level security;
alter table public.faq_items      enable row level security;

drop policy if exists "faq_categories read non-draft" on public.faq_categories;
create policy "faq_categories read non-draft" on public.faq_categories for select
  using (status <> 'draft' or public.is_admin());

drop policy if exists "faq_categories admin write" on public.faq_categories;
create policy "faq_categories admin write" on public.faq_categories for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "faq_items read non-draft" on public.faq_items;
create policy "faq_items read non-draft" on public.faq_items for select
  using (status <> 'draft' or public.is_admin());

drop policy if exists "faq_items admin write" on public.faq_items;
create policy "faq_items admin write" on public.faq_items for all
  using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Seed: migrate the four categories + items previously hard-coded
-- in src/messages/zh-TW.json so the admin lands on a populated table.
-- ─────────────────────────────────────────────────────────────
insert into public.faq_categories (slug, title, title_en, kicker, display_order, status) values
  ('courses', '課程相關', 'Courses',           'COURSES',           0, 'open'),
  ('trips',   '行程相關', 'Trips',             'TRIPS',             1, 'open'),
  ('gear',    '裝備與安全', 'Gear & safety',   'GEAR & SAFETY',     2, 'open'),
  ('booking', '報名與付款', 'Booking & payment','BOOKING & PAYMENT',3, 'open')
on conflict (slug) do nothing;

do $$
declare
  cat_courses uuid;
  cat_trips   uuid;
  cat_gear    uuid;
  cat_booking uuid;
begin
  select id into cat_courses from public.faq_categories where slug = 'courses';
  select id into cat_trips   from public.faq_categories where slug = 'trips';
  select id into cat_gear    from public.faq_categories where slug = 'gear';
  select id into cat_booking from public.faq_categories where slug = 'booking';

  if not exists (select 1 from public.faq_items where category_id = cat_courses) then
    insert into public.faq_items (category_id, question, question_en, answer, answer_en, display_order) values
      (cat_courses,
        '完全沒潛水經驗，可以直接報課嗎？',
        'No diving experience — can I sign up directly?',
        '可以。AIDA 2 自由潛水和 PADI OWD 水肺都是入門等級課程，會從理論、平靜水域開始，循序漸進進入海域。',
        'Yes. AIDA 2 freediving and PADI OWD scuba are entry-level — theory first, then confined water, then open water.',
        0),
      (cat_courses,
        '需要會游泳嗎？要游多遠？',
        'Do I need to know how to swim?',
        '需要能連續游泳 200 公尺（自由式或蛙式皆可，速度不限），並能在深水區踩水 10 分鐘。如果游泳能力不夠，建議先去泳池練一陣子。',
        'You need to swim 200 m continuously (any stroke, any pace) and tread water 10 minutes. Practice in a pool first if needed.',
        1),
      (cat_courses,
        'AIDA 跟 PADI 差在哪？我該選哪個？',
        'AIDA vs PADI — which should I pick?',
        e'AIDA 是自由潛水（不背氣瓶，靠閉氣下潛），重視放鬆與身體覺察。\nPADI 是水肺潛水（背氣瓶呼吸），能在水下停留更久、探索範圍更廣。\n如果想體驗「一口氣的寧靜」選 AIDA，想「水下漫遊看魚看珊瑚」選 PADI。',
        e'AIDA is freediving (no tank, single breath) — focuses on relaxation and body awareness.\nPADI is scuba (breathing from a tank) — longer bottom time, wider exploration.\nFor stillness on one breath, choose AIDA. For exploring reefs and fish, choose PADI.',
        2),
      (cat_courses,
        '近視可以潛水嗎？',
        'Can I dive if I wear glasses?',
        '可以。我們有度數面鏡可借用（100-700 度），請於報名時備註。長期潛水建議自行訂製度數面鏡，較為合臉。',
        'Yes. We have prescription masks (100–700 degrees) to borrow — mention it when booking. For frequent diving, a custom-fitted prescription mask is recommended.',
        3),
      (cat_courses,
        '課程拿到證照後，能潛多深？',
        'How deep can I dive once certified?',
        e'AIDA 2 認證標準為 16 公尺，多數學員結訓時能達 15-20 公尺。\nPADI OWD 認證後可在 18 公尺內的開放水域進行潛水。\n想下到更深需要進階課程。',
        e'AIDA 2 cert depth is 16 m; most students reach 15–20 m by the end.\nPADI OWD lets you dive open water within 18 m.\nDeeper requires advanced courses.',
        4);
  end if;

  if not exists (select 1 from public.faq_items where category_id = cat_trips) then
    insert into public.faq_items (category_id, question, question_en, answer, answer_en, display_order) values
      (cat_trips,
        '沒有證照可以參加 fun dive 行程嗎？',
        'Can I join a fun-dive trip without a certification?',
        'fun dive（休閒潛水）需要對應的證照（自由潛水 AIDA 2 以上、水肺 OWD 以上）。如果沒有證照，建議先報名「體驗潛水」或直接考證照。',
        'Fun dives require a matching cert (AIDA 2+ for freediving, OWD+ for scuba). Otherwise, start with a Discover Dive or take a cert course first.',
        0),
      (cat_trips,
        '行程包含哪些費用？',
        'What is included in the trip fee?',
        e'通常包含：船潛 / 岸潛費、氣瓶 / 配重、教練 / DM 帶領、住宿、早午餐、海上保險、潛點導覽。\n不含：個人裝備租金、來回機票 / 船票、晚餐、酒水、額外小費。\n各行程實際內容請看該行程頁的「包含 / 不包含」。',
        e'Usually included: boat/shore dives, tank & weights, guide, lodging, breakfast & lunch, on-water insurance, site briefing.\nNot included: personal gear rental, ferry/flight, dinner, drinks, extra tips.\nCheck each trip page for the exact "Included / Not included" list.',
        1),
      (cat_trips,
        '可以幫忙安排來回交通嗎？',
        'Can you help arrange transport?',
        '綠島 / 蘭嶼 / 小琉球皆有合作的船公司，報名後我們會協助訂船票（自費）。台東 / 屏東當地接送可加購。',
        'We work with ferry operators for Ludao / Lanyu / Liuqiu — we''ll help book tickets (at your cost). Local pickups in Taitung/Pingtung available as add-ons.',
        2),
      (cat_trips,
        '天氣不好怎麼辦？會退費嗎？',
        'What happens if the weather is bad?',
        e'潛水安全第一。若因天候 / 海況導致無法下水：\n· 部分潛水取消：補替代行程或退潛點費\n· 全部取消：扣除已支出成本後全額退費，或保留改下次梯次',
        e'Safety first. If weather/sea conditions cancel diving:\n· Partial cancellation: replacement activities or refund of the missed dives\n· Full cancellation: full refund minus sunk costs, or roll forward to a future trip',
        3),
      (cat_trips,
        '可以一個人報名嗎？',
        'Can I book solo?',
        '可以！我們的行程多為小團制 (4-8 人)，一人報名也會幫你媒合，很多潛友都是這樣認識的。',
        'Absolutely. Trips run 4–8 people; solo travelers get paired up — most of our regulars met that way.',
        4);
  end if;

  if not exists (select 1 from public.faq_items where category_id = cat_gear) then
    insert into public.faq_items (category_id, question, question_en, answer, answer_en, display_order) values
      (cat_gear,
        '我需要自己買裝備嗎？',
        'Do I need to buy my own gear?',
        e'課程與大部分 fun dive 都提供基本裝備（BCD、調節器、氣瓶、配重、3mm 防寒衣）。\n建議自備：面鏡、呼吸管、蛙鞋、潛水襪（衛生 + 合臉度）。\n進階潛水員會逐步購買全套個人裝備。',
        e'Courses and most fun dives include core gear (BCD, regulator, tank, weights, 3 mm wetsuit).\nBring your own: mask, snorkel, fins, dive socks (hygiene + fit).\nAdvanced divers tend to build a full personal kit over time.',
        0),
      (cat_gear,
        '潛水有什麼健康限制？',
        'Any health restrictions for diving?',
        e'報名時會請你填健康聲明。以下狀況建議先諮詢潛水醫師：\n· 心血管疾病、嚴重氣喘\n· 中耳炎、鼻竇炎反覆發作\n· 懷孕\n· 近期手術 / 重大疾病\n感冒、過敏發作期間請不要勉強下水。',
        e'You''ll fill out a medical declaration. Consult a dive doctor first if you have:\n· Cardiovascular issues or severe asthma\n· Recurrent ear/sinus infections\n· Pregnancy\n· Recent surgery or major illness\nNever dive while sick or with active allergies.',
        1),
      (cat_gear,
        '潛水保險怎麼處理？',
        'How is dive insurance handled?',
        '我們所有行程都包含船上意外險。建議學員自行加保 DAN 潛水專屬保險（含高壓艙費用），考證後我們會協助說明。',
        'All trips include on-water accident insurance. We recommend supplementary DAN dive insurance (covers chamber treatment) — we''ll walk you through after certification.',
        2),
      (cat_gear,
        '潛水後可以馬上搭飛機嗎？',
        'Can I fly right after diving?',
        e'不可以。為避免減壓病：\n· 單次潛水後：至少間隔 12 小時\n· 多次潛水 / 連續多日潛水：至少間隔 18 小時\n安排行程時請把這段時間算進去。',
        e'No — to avoid decompression sickness:\n· Single dive: wait at least 12 hours\n· Multiple dives / multi-day diving: at least 18 hours\nFactor this into your travel schedule.',
        3);
  end if;

  if not exists (select 1 from public.faq_items where category_id = cat_booking) then
    insert into public.faq_items (category_id, question, question_en, answer, answer_en, display_order) values
      (cat_booking,
        '怎麼報名？',
        'How do I book?',
        '從網站行程 / 課程頁直接送出報名表，我們會在 24 小時內透過 LINE 或 Email 跟你確認，並引導完成付款。',
        'Submit the booking form on any trip or course page. We''ll confirm via LINE or email within 24 hours and walk you through payment.',
        0),
      (cat_booking,
        '付款方式有哪些？',
        'What payment methods are accepted?',
        '支援台幣銀行轉帳、LINE Pay、信用卡（透過第三方金流，少量手續費）。海外學員可使用 Wise / PayPal。',
        'TWD bank transfer, LINE Pay, credit card (small processing fee via third-party gateway). International students can use Wise or PayPal.',
        1),
      (cat_booking,
        '訂金 / 尾款怎麼算？',
        'Deposit and balance — how does it work?',
        e'課程：報名時繳訂金 NT$ 3,000-5,000，開課前 7 天繳清尾款。\n行程：報名時繳全額或訂金 50%，出發前 14 天繳清。',
        e'Courses: NT$ 3,000–5,000 deposit at booking, balance due 7 days before start.\nTrips: pay in full or 50% deposit at booking, balance due 14 days before departure.',
        2),
      (cat_booking,
        '取消政策？',
        'Cancellation policy?',
        e'出發 / 開課日前：\n· 15 天前取消：全額退費（扣手續費）\n· 7-14 天：退 70%\n· 3-6 天：退 50%\n· 3 天內 / 當日：無法退費\n因天候 / 不可抗力另有規定，見上方「行程相關」。',
        e'Before departure/start date:\n· 15+ days out: full refund (less processing fee)\n· 7–14 days: 70% refund\n· 3–6 days: 50% refund\n· Within 3 days / same day: no refund\nWeather / force-majeure handled separately — see "Trips" above.',
        3);
  end if;
end $$;
