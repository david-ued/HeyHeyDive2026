import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {listFaqCategories} from '@/lib/cms/queries';
import {MissingTableNotice} from '@/components/admin/form-fields';
import {FaqItemForm} from '../../_components/item-form';

export const dynamic = 'force-dynamic';

export default async function NewFaqItemPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{category?: string}>;
}) {
  const {locale} = await params;
  const {category} = await searchParams;
  const cats = await listFaqCategories();
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}/admin/faqs`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" /> 返回 FAQ 列表
      </Link>
      <header>
        <h1 className="font-heading text-2xl font-bold text-navy-900">新增問題</h1>
      </header>

      {cats.status === 'missing-table' ? (
        <MissingTableNotice />
      ) : cats.status === 'error' ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {cats.error}
        </p>
      ) : cats.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          請先建立至少一個分類。
          <Link
            href={`/${locale}/admin/faqs/categories/new`}
            className="ml-2 font-medium text-coral hover:underline"
          >
            建立分類 →
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <FaqItemForm
            categories={cats.rows}
            defaultCategoryId={category}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}
