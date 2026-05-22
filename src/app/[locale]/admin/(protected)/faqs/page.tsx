import Link from 'next/link';
import {Plus} from 'lucide-react';
import {listFaqWithItems} from '@/lib/cms/queries';
import {MissingTableNotice} from '@/components/admin/form-fields';

export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-gray-100 text-gray-500'
};
const STATUS_LABEL: Record<string, string> = {open: '上架', draft: '草稿'};

export default async function AdminFaqsList({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const result = await listFaqWithItems();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">常見問題管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            FAQ 分類與問題。分類顯示於 /faq 頁的 tab，刪除分類會連同底下的問題一併刪除。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${locale}/admin/faqs/categories/new`}
            className="inline-flex items-center gap-2 rounded-md border border-coral px-4 py-2 text-sm font-semibold text-coral hover:bg-coral/5"
          >
            <Plus className="h-4 w-4" /> 新增分類
          </Link>
          <Link
            href={`/${locale}/admin/faqs/items/new`}
            className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> 新增問題
          </Link>
        </div>
      </header>

      {result.status === 'missing-table' ? (
        <MissingTableNotice />
      ) : result.status === 'error' ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{result.error}</p>
      ) : result.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          還沒有任何分類。
          <Link
            href={`/${locale}/admin/faqs/categories/new`}
            className="ml-2 font-medium text-coral hover:underline"
          >
            建立第一個分類 →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {result.rows.map((cat) => (
            <section
              key={cat.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading text-base font-semibold text-navy-900">
                      {cat.title}
                    </span>
                    <span className="font-en text-xs text-gray-400">/{cat.slug}</span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[cat.status]}`}
                    >
                      {STATUS_LABEL[cat.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    顯示順序 {cat.display_order}
                    {cat.kicker ? <> · 標記 <span className="font-en">{cat.kicker}</span></> : null}
                    {cat.title_en ? <> · EN <span className="font-en">{cat.title_en}</span></> : null}
                    {cat.title_ja ? <> · JA <span>{cat.title_ja}</span></> : null}
                    {' · '}
                    {cat.items.length} 題
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${locale}/admin/faqs/items/new?category=${cat.id}`}
                    className="text-xs font-medium text-coral hover:underline"
                  >
                    + 新增問題
                  </Link>
                  <Link
                    href={`/${locale}/admin/faqs/categories/${cat.id}`}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    編輯分類
                  </Link>
                </div>
              </header>

              {cat.items.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-500">
                  此分類尚無問題。
                  <Link
                    href={`/${locale}/admin/faqs/items/new?category=${cat.id}`}
                    className="ml-2 font-medium text-coral hover:underline"
                  >
                    新增第一題 →
                  </Link>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-2 w-12">#</th>
                      <th className="px-4 py-2">問題</th>
                      <th className="px-4 py-2 w-24">狀態</th>
                      <th className="px-4 py-2 w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {cat.items.map((it) => (
                      <tr key={it.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-en text-xs text-gray-400">
                          {it.display_order}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-navy-900">{it.question}</div>
                          {it.question_en ? (
                            <div className="mt-0.5 text-xs text-gray-500">{it.question_en}</div>
                          ) : null}
                          {it.question_ja ? (
                            <div className="mt-0.5 text-xs text-gray-500">{it.question_ja}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[it.status]}`}
                          >
                            {STATUS_LABEL[it.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/${locale}/admin/faqs/items/${it.id}`}
                            className="text-sm font-medium text-coral hover:underline"
                          >
                            編輯
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
