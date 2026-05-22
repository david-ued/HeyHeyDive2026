import Link from 'next/link';
import {Plus, ShoppingBag} from 'lucide-react';
import {listMerchProducts} from '@/lib/cms/queries';
import {MissingTableNotice} from '@/components/admin/form-fields';

export const dynamic = 'force-dynamic';

const CATEGORY_LABEL: Record<string, string> = {
  apparel: '服飾',
  accessory: '配件',
  gear: '裝備',
  print: '印刷品',
  other: '其他'
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  sold_out: 'bg-gold/20 text-amber-700',
  draft: 'bg-gray-100 text-gray-500',
  archived: 'bg-gray-200 text-gray-500'
};

const STATUS_LABEL: Record<string, string> = {
  active: '上架中',
  sold_out: '已售完',
  draft: '草稿',
  archived: '封存'
};

export default async function AdminMerchList({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const result = await listMerchProducts();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">限量周邊</h1>
          <p className="mt-1 text-sm text-gray-500">
            建立、編輯、上架商品。狀態為「上架中」「已售完」會出現在 /merch
          </p>
        </div>
        <Link
          href={`/${locale}/admin/merch/new`}
          className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> 新增商品
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
          <ShoppingBag className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            還沒有任何商品。
            <Link
              href={`/${locale}/admin/merch/new`}
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
                <th className="px-4 py-3">商品</th>
                <th className="px-4 py-3">分類</th>
                <th className="px-4 py-3">價格</th>
                <th className="px-4 py-3">庫存</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3 text-right">動作</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.cover_image}
                          alt={p.name}
                          className="h-12 w-12 rounded-md border border-gray-200 bg-gray-50 object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-gray-100" />
                      )}
                      <div>
                        <div className="font-medium text-navy-900">{p.name}</div>
                        <div className="font-en text-xs text-gray-500">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {CATEGORY_LABEL[p.category] ?? p.category}
                  </td>
                  <td className="px-4 py-3 font-en text-xs">
                    <div className="text-navy-900">
                      NT$ {p.price_twd.toLocaleString()}
                    </div>
                    {p.compare_at_price_twd ? (
                      <div className="text-gray-400 line-through">
                        NT$ {p.compare_at_price_twd.toLocaleString()}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {p.stock == null ? '—' : p.stock === 0 ? '0' : p.stock}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[p.status] ?? STATUS_BADGE.draft
                      }`}
                    >
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/${locale}/admin/merch/${p.id}`}
                      className="text-xs font-medium text-coral hover:underline"
                    >
                      編輯 →
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
