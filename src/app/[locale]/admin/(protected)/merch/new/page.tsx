import Link from 'next/link';
import {ChevronLeft} from 'lucide-react';
import {MerchForm} from '../_components/merch-form';

export default async function AdminMerchNew({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}/admin/merch`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900"
      >
        <ChevronLeft className="h-4 w-4" /> 回到商品列表
      </Link>
      <header>
        <p className="font-en text-xs font-bold tracking-[0.2em] text-coral">
          NEW PRODUCT
        </p>
        <h1 className="font-heading text-2xl font-bold text-navy-900">新增商品</h1>
        <p className="mt-1 text-sm text-gray-500">
          填入基本資訊、價格、特色與圖片。狀態為「草稿」時前台不會顯示。
        </p>
      </header>
      <MerchForm locale={locale} />
    </div>
  );
}
