import Link from 'next/link';
import {Plus} from 'lucide-react';
import {listTrips} from '@/lib/cms/queries';
import {MissingTableNotice} from '@/components/admin/form-fields';

export const dynamic = 'force-dynamic';

const DESTINATION_LABEL: Record<string, string> = {
  ludao: '綠島',
  lanyu: '蘭嶼',
  liuqiu: '小琉球',
  kenting: '墾丁',
  other: '其他'
};

const KIND_LABEL: Record<string, string> = {
  padi: 'PADI',
  aida: 'AIDA',
  experience: '體驗',
  other: '其他'
};

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700',
  sold_out: 'bg-gold/20 text-amber-700',
  closed: 'bg-gray-200 text-gray-600',
  draft: 'bg-gray-100 text-gray-500'
};

const STATUS_LABEL: Record<string, string> = {
  open: '開放',
  sold_out: '已售完',
  closed: '結束',
  draft: '草稿'
};

export default async function AdminTripsList({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const result = await listTrips();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">行程管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            建立、編輯、上架旅行行程。狀態為「開放」的行程會自動出現在 /calendar
          </p>
        </div>
        <Link
          href={`/${locale}/admin/trips/new`}
          className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> 新增行程
        </Link>
      </header>

      {result.status === 'missing-table' ? (
        <MissingTableNotice />
      ) : result.status === 'error' ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {result.error}
        </p>
      ) : result.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">
            還沒有任何行程。
            <Link
              href={`/${locale}/admin/trips/new`}
              className="ml-2 font-medium text-coral hover:underline"
            >
              建立第一個 →
            </Link>
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">標題</th>
                <th className="px-4 py-3">日期</th>
                <th className="px-4 py-3">目的地 / 類型</th>
                <th className="px-4 py-3">價格</th>
                <th className="px-4 py-3">名額</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((t) => (
                <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy-900">{t.title}</div>
                    <div className="font-en text-xs text-gray-500">{t.slug}</div>
                  </td>
                  <td className="px-4 py-3 font-en text-xs text-gray-600">
                    <div>{t.start_date}</div>
                    <div>→ {t.end_date}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {DESTINATION_LABEL[t.destination] ?? t.destination}
                    <span className="mx-1 text-gray-300">·</span>
                    {KIND_LABEL[t.kind] ?? t.kind}
                  </td>
                  <td className="px-4 py-3 font-en font-semibold text-navy-900">
                    NT$ {t.price_twd.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-en text-xs text-gray-600">
                    {t.available_seats} / {t.capacity}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[t.status]}`}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/${locale}/admin/trips/${t.id}`}
                      className="text-sm font-medium text-coral hover:underline"
                    >
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
