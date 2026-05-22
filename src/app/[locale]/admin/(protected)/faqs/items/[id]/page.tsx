import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {getFaqItem, listFaqCategories} from '@/lib/cms/queries';
import {FaqItemForm} from '../../_components/item-form';

export const dynamic = 'force-dynamic';

export default async function EditFaqItemPage({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  const item = await getFaqItem(id);
  if (!item) notFound();
  const cats = await listFaqCategories();
  const categories = cats.status === 'ok' ? cats.rows : [];
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}/admin/faqs`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" /> 返回 FAQ 列表
      </Link>
      <header>
        <h1 className="font-heading text-2xl font-bold text-navy-900">編輯問題</h1>
      </header>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <FaqItemForm item={item} categories={categories} locale={locale} />
      </div>
    </div>
  );
}
