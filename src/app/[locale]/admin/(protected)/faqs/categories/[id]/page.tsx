import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {getFaqCategory} from '@/lib/cms/queries';
import {FaqCategoryForm} from '../../_components/category-form';

export const dynamic = 'force-dynamic';

export default async function EditFaqCategoryPage({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  const category = await getFaqCategory(id);
  if (!category) notFound();
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}/admin/faqs`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" /> 返回 FAQ 列表
      </Link>
      <header>
        <h1 className="font-heading text-2xl font-bold text-navy-900">編輯分類</h1>
        <p className="mt-1 font-en text-xs text-gray-500">/{category.slug}</p>
      </header>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <FaqCategoryForm category={category} locale={locale} />
      </div>
    </div>
  );
}
