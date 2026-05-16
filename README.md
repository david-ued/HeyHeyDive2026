# HeyHeyDive 2026

> 台灣四大潛點（小琉球・綠島・蘭嶼・墾丁）潛旅與 AIDA / PADI 雙系統證照課程官網。
>
> 結構依據 `HeyHeyDive_PRD_for_Pencil.md`。

## Stack

| 層 | 選型 |
| --- | --- |
| Framework | **Next.js 16** (App Router, Turbopack, TypeScript) |
| Styling | **Tailwind CSS v4** + **shadcn/ui** (New York) |
| i18n | **next-intl** — 路由前綴 `/zh-TW` `/en` |
| Auth + DB | **Supabase** (`@supabase/ssr`)（待你串接 keys） |
| Hosting | **Zeabur** |
| Package manager | **pnpm** |

## 開發

```bash
pnpm install
cp .env.local.example .env.local   # 填入 Supabase keys 後再執行
pnpm dev                            # http://localhost:3000 → 會 redirect 到 /zh-TW
```

預設 locale 是 `zh-TW`，根路徑 `/` 會被 middleware 導向 `/zh-TW`。

## 目錄結構

```
src/
├── app/
│   ├── layout.tsx                      # 根 layout（passthrough；html/body 在 [locale]）
│   ├── globals.css                     # Tailwind v4 + PRD design tokens
│   ├── api/                            # API Routes（前後端不分離）
│   └── [locale]/
│       ├── layout.tsx                  # <html lang>、字型、NextIntlClientProvider
│       ├── (marketing)/                # 前台：行銷網站（不加 URL prefix）
│       │   ├── layout.tsx              # 之後放 Header / Footer
│       │   └── page.tsx                # 首頁（目前為佔位）
│       ├── (auth)/                     # 登入 / 註冊 / 忘記密碼
│       ├── member/                     # 後台：會員中心 (/member/*)
│       └── admin/                      # 後台：管理員 (/admin/*)
├── components/
│   ├── ui/                             # shadcn/ui 元件（用 `pnpm dlx shadcn add` 加）
│   ├── marketing/                      # 行銷網站專屬元件（DiveTripCard 等）
│   ├── member/
│   └── admin/
├── lib/
│   ├── utils.ts                        # cn() helper
│   └── supabase/
│       ├── client.ts                   # browser client
│       ├── server.ts                   # server component / action client
│       └── middleware.ts               # middleware 內 session refresh
├── i18n/
│   ├── routing.ts                      # locales 設定
│   ├── request.ts                      # next-intl request config
│   └── navigation.ts                   # locale-aware <Link>, useRouter
├── messages/
│   ├── zh-TW.json
│   └── en.json
├── proxy.ts                            # next-intl + Supabase session refresh (Next.js 16 renamed middleware → proxy)
└── types/
```

### Route groups 為什麼這樣切

- `(marketing)` — 前台 17 頁，共用 Header / Footer，不加 URL prefix（首頁 = `/zh-TW`）
- `(auth)` — 登入註冊，獨立的乾淨版面（無前台 nav）
- `member/` — 會員後台，URL 帶 `/member/` 前綴，需 Supabase auth gate
- `admin/` — 管理員後台，URL 帶 `/admin/` 前綴，需 admin role gate

`(xxx)` 括號代表 **不影響 URL** 的群組；不帶括號的 `member` / `admin` **會出現在 URL** 並用於 access control。

## i18n 用法

```tsx
// Server component
import {getTranslations} from 'next-intl/server';
const t = await getTranslations('Meta');

// Client component
'use client';
import {useTranslations} from 'next-intl';
const t = useTranslations('Placeholder');

// 跨語系連結（自動加 /zh-TW 前綴）
import {Link} from '@/i18n/navigation';
<Link href="/about">關於我們</Link>
```

新增字串時兩個檔案 `src/messages/zh-TW.json`、`src/messages/en.json` 都要加。

## shadcn/ui

第一次加元件前：

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card dialog input ...
```

`components.json` 已設定好，元件會落在 `src/components/ui/`。

## Supabase 接入流程（之後做）

1. 上 [Supabase Dashboard](https://supabase.com/dashboard) 建專案。
2. 把 `Project URL` 與 `anon public` key 填到 `.env.local`。
3. 設計 schema（users / trips / courses / orders / dive_logs…）、開 RLS、跑 migration。
4. 認證頁面放在 `(auth)/`，session 由 `src/proxy.ts` 自動 refresh。
5. 受保護頁面在 `member/layout.tsx` 或 `admin/layout.tsx` 加 server-side auth guard。

## 部署到 Zeabur

1. 把 repo 連到 [Zeabur](https://zeabur.com)。
2. Zeabur 會自動偵測 Next.js，無需 `zeabur.json`。
3. 在 Zeabur 環境變數面板填 `.env.local.example` 裡所有 keys。
4. Build command 預設 `pnpm build`；start command 預設 `pnpm start`。
5. 綁定 domain。

## Next steps（建議順序）

1. **Supabase**：開專案、定 schema、寫 RLS、把 keys 填進 `.env.local`。
2. **shadcn/ui 基礎元件**：button / input / card / dialog / accordion / sheet / dropdown / tabs / toast。
3. **Pencil design system 對齊**：PRD §4.1 / §4.2 對到 Pencil 後在 `globals.css` 微調。
4. **行銷站元件**：Header / Footer / DiveTripCard / DestinationCard / CourseCard / SeasonTag。
5. **依 PRD §4.4 一頁一頁開**：首頁 → 潛點介紹 → 行程列表 → 行程詳情 → 課程 → Q&A → 結帳 → 會員中心。
6. **Admin 後台**：行程 / 課程 / 訂單 / 內容 / 會員管理。
