import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {FaqCategoryForm} from '../../_components/category-form';

export default async function NewFaqCategoryPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}/admin/faqs`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" /> 返回 FAQ 列表
      </Link>
      <header>
        <h1 className="font-heading text-2xl font-bold text-navy-900">新增分類</h1>
      </header>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <FaqCategoryForm locale={locale} />
      </div>
    </div>
  );
}
