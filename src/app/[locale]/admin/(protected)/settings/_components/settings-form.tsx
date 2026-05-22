'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import {saveSiteSettingsAction, type SettingsFormState} from '../actions';
import type {SiteSettings} from '@/lib/cms/types';
import {
  FieldLabel,
  FormError,
  Textarea,
  TextInput
} from '@/components/admin/form-fields';

const initial: SettingsFormState = {error: null, success: false};

export function SettingsForm({settings}: {settings: SiteSettings}) {
  const [state, formAction] = useActionState(saveSiteSettingsAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
        <header>
          <h2 className="font-heading text-lg font-bold text-navy-900">SEO Meta（中文）</h2>
          <p className="mt-1 text-xs text-gray-500">
            zh-TW 路徑使用。預設值來自翻譯檔，填了會覆蓋。
          </p>
        </header>
        <FieldLabel label="Meta Title（中文）" hint="顯示在瀏覽器分頁與 Google 搜尋結果">
          <TextInput
            name="meta_title"
            defaultValue={settings.meta_title ?? ''}
            placeholder="HeyHeyDive 海海潛旅"
          />
        </FieldLabel>
        <FieldLabel label="Meta Description（中文）" hint="建議 120–160 字元">
          <Textarea
            name="meta_description"
            rows={3}
            defaultValue={settings.meta_description ?? ''}
            placeholder="台灣四大潛點 — 小琉球、綠島、蘭嶼、墾丁 — 的潛旅與雙系統證照課程"
          />
        </FieldLabel>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
        <header>
          <h2 className="font-heading text-lg font-bold text-navy-900">SEO Meta (English)</h2>
          <p className="mt-1 text-xs text-gray-500">Used on /en routes.</p>
        </header>
        <FieldLabel label="Meta Title (English)">
          <TextInput
            name="meta_title_en"
            defaultValue={settings.meta_title_en ?? ''}
            placeholder="HeyHeyDive"
          />
        </FieldLabel>
        <FieldLabel label="Meta Description (English)">
          <Textarea
            name="meta_description_en"
            rows={3}
            defaultValue={settings.meta_description_en ?? ''}
            placeholder="Diving trips and certification courses at Taiwan's four signature dive sites."
          />
        </FieldLabel>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
        <header>
          <h2 className="font-heading text-lg font-bold text-navy-900">SEO Meta (日本語)</h2>
          <p className="mt-1 text-xs text-gray-500">/ja ルートで使用されます。</p>
        </header>
        <FieldLabel label="Meta Title (日本語)">
          <TextInput
            name="meta_title_ja"
            defaultValue={settings.meta_title_ja ?? ''}
            placeholder="HeyHeyDive ヘイヘイダイブ"
          />
        </FieldLabel>
        <FieldLabel label="Meta Description (日本語)">
          <Textarea
            name="meta_description_ja"
            rows={3}
            defaultValue={settings.meta_description_ja ?? ''}
            placeholder="台湾の四大ダイブスポット — 小琉球・緑島・蘭嶼・墾丁 — のツアーとAIDA/PADI認定コース。"
          />
        </FieldLabel>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
        <header>
          <h2 className="font-heading text-lg font-bold text-navy-900">圖示 / 預覽圖</h2>
          <p className="mt-1 text-xs text-gray-500">
            填入完整 URL（建議放 /public/images/ 後用 <code>/images/xxx.png</code>）。
          </p>
        </header>
        <FieldLabel label="Favicon URL" hint="建議 32×32 或 SVG，如 /images/heyhey.jpg">
          <TextInput
            name="favicon_url"
            defaultValue={settings.favicon_url ?? ''}
            placeholder="/images/heyhey.jpg"
          />
        </FieldLabel>
        <FieldLabel label="OG 預覽圖 URL" hint="社群分享預覽圖，建議 1200×630">
          <TextInput
            name="og_image_url"
            defaultValue={settings.og_image_url ?? ''}
            placeholder="/images/og-cover.jpg"
          />
        </FieldLabel>

        <FaviconPreview src={settings.favicon_url} />
      </section>

      <FormError error={state.error} />
      {state.success ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          已儲存。重新整理前台即可看到新 meta / favicon。
        </p>
      ) : null}

      <div className="flex justify-end border-t border-gray-200 pt-5">
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const {pending} = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-coral px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
    >
      {pending ? '儲存中…' : '儲存設定'}
    </button>
  );
}

function FaviconPreview({src}: {src: string | null}) {
  if (!src) return null;
  return (
    <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
      <span className="text-xs text-gray-500">目前 favicon：</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="favicon preview" className="h-8 w-8 rounded-sm object-cover" />
      <code className="truncate text-xs text-gray-600">{src}</code>
    </div>
  );
}
