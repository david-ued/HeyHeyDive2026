import {getSiteSettings} from '@/lib/cms/site-settings';
import {SettingsForm} from './_components/settings-form';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-en text-xs font-bold tracking-[0.2em] text-coral">SETTINGS</p>
        <h1 className="font-heading text-2xl font-bold text-navy-900">網站設定</h1>
        <p className="mt-1 text-sm text-gray-500">
          編輯前台 SEO meta title / description 與 favicon。儲存後會即時套用到所有頁面。
        </p>
      </header>

      <SettingsForm settings={settings} />
    </div>
  );
}
