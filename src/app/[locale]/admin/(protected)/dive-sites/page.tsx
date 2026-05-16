import Link from 'next/link';
import {Plus} from 'lucide-react';
import {listDiveSites} from '@/lib/cms/queries';
import {MissingTableNotice} from '@/components/admin/form-fields';

export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-200 text-gray-600',
  draft: 'bg-gray-100 text-gray-500'
};
const STATUS_LABEL: Record<string, string> = {
  open: '上架',
  closed: '隱藏',
  draft: '草稿'
};

export default async function AdminDiveSitesList({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const result = await listDiveSites();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">景點管理</h1>
          <p className="mt-1 text-sm text-gray-500">建立或編輯潛點介紹（綠島、蘭嶼、小琉球…）。</p>
        </div>
        <Link
          href={`/${locale}/admin/dive-sites/new`}
          className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> 新增景點
        </Link>
      </header>

      {result.status === 'missing-table' ? (
        <MissingTableNotice />
      ) : result.status === 'error' ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{result.error}</p>
      ) : result.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          還沒有任何景點。
          <Link href={`/${locale}/admin/dive-sites/new`} className="ml-2 font-medium text-coral hover:underline">
            建立第一個 →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">名稱</th>
                <th className="px-4 py-3">地區</th>
                <th className="px-4 py-3">水溫 / 能見度</th>
                <th className="px-4 py-3">排序</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy-900">{s.name}</div>
                    <div className="font-en text-xs text-gray-500">{s.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.region ?? '—'}</td>
                  <td className="px-4 py-3 font-en text-xs text-gray-600">
                    {s.temp ?? '—'} · {s.visibility ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-en text-gray-600">{s.display_order}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/${locale}/admin/dive-sites/${s.id}`} className="text-sm font-medium text-coral hover:underline">
                      編輯
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
