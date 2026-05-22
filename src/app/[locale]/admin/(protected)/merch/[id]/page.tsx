import {notFound} from 'next/navigation';
import Link from 'next/link';
import {ChevronLeft, ExternalLink} from 'lucide-react';
import {getMerchProductWithVariants} from '@/lib/cms/queries';
import {MerchForm} from '../_components/merch-form';

export const dynamic = 'force-dynamic';

export default async function AdminMerchEdit({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  const product = await getMerchProductWithVariants(id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}/admin/merch`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900"
      >
        <ChevronLeft className="h-4 w-4" /> 回到商品列表
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-en text-xs font-bold tracking-[0.2em] text-coral">
            EDIT · {product.slug}
          </p>
          <h1 className="font-heading text-2xl font-bold text-navy-900">
            {product.name}
          </h1>
        </div>
        <Link
          href={`/${locale}/merch/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-md border border-coral/40 bg-coral/5 px-3 py-1.5 text-xs font-medium text-coral hover:bg-coral/10"
        >
          <ExternalLink className="h-3.5 w-3.5" /> 預覽前台頁面
        </Link>
      </header>
      <MerchForm product={product} locale={locale} />
    </div>
  );
}
