import Link from 'next/link';
import {Plus} from 'lucide-react';
import {listCourses} from '@/lib/cms/queries';
import {MissingTableNotice} from '@/components/admin/form-fields';

export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-200 text-gray-600',
  draft: 'bg-gray-100 text-gray-500'
};
const STATUS_LABEL: Record<string, string> = {open: '上架', closed: '隱藏', draft: '草稿'};
const SYSTEM_LABEL: Record<string, string> = {aida: 'AIDA', padi: 'PADI', other: '其他'};

export default async function AdminCoursesList({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const result = await listCourses();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">課程管理</h1>
          <p className="mt-1 text-sm text-gray-500">AIDA / PADI 各級課程資料。</p>
        </div>
        <Link
          href={`/${locale}/admin/courses/new`}
          className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> 新增課程
        </Link>
      </header>

      {result.status === 'missing-table' ? (
        <MissingTableNotice />
      ) : result.status === 'error' ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{result.error}</p>
      ) : result.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          還沒有任何課程。
          <Link href={`/${locale}/admin/courses/new`} className="ml-2 font-medium text-coral hover:underline">
            建立第一個 →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">課程</th>
                <th className="px-4 py-3">系統 / 等級</th>
                <th className="px-4 py-3">時長</th>
                <th className="px-4 py-3">價格</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy-900">{c.title}</div>
                    <div className="font-en text-xs text-gray-500">{c.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {SYSTEM_LABEL[c.system] ?? c.system}
                    <span className="mx-1 text-gray-300">·</span>
                    {c.level}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.duration ?? '—'}</td>
                  <td className="px-4 py-3 font-en font-semibold text-navy-900">
                    NT$ {c.price_twd.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/${locale}/admin/courses/${c.id}`} className="text-sm font-medium text-coral hover:underline">
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
