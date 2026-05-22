import {notFound} from 'next/navigation';
import {ChevronLeft, ShieldCheck, Sparkles, Truck} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {
  getMerchProductWithVariantsBySlug,
  listPublicMerchProducts
} from '@/lib/cms/queries';
import type {MerchProduct} from '@/lib/cms/types';
import {ProductGallery} from './_components/product-gallery';
import {VariantPicker} from './_components/variant-picker';

export const dynamic = 'force-dynamic';

const CATEGORY_LABEL: Record<string, string> = {
  apparel: '服飾',
  accessory: '配件',
  gear: '裝備',
  print: '印刷品',
  other: '其他'
};

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {slug} = await params;
  const product = await getMerchProductWithVariantsBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} · HeyHeyDive 限量周邊`,
    description: product.short_description ?? undefined
  };
}

export default async function MerchProductPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {slug} = await params;
  const product = await getMerchProductWithVariantsBySlug(slug);
  if (!product || product.status === 'draft' || product.status === 'archived') {
    notFound();
  }

  const onSale =
    product.compare_at_price_twd && product.compare_at_price_twd > product.price_twd;

  // Aggregate stock across non-archived variants; falls back to product.stock for
  // legacy rows still living without variants.
  const totalStock = product.variants
    .filter((v) => v.status !== 'archived')
    .reduce((sum, v) => sum + v.stock, 0);
  const soldOut =
    product.status === 'sold_out' ||
    (product.variants.length > 0 && totalStock === 0);

  const allProducts = await listPublicMerchProducts();
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const images = [product.cover_image, ...product.gallery].filter(
    (u): u is string => !!u
  );

  return (
    <div className="bg-off-white text-ink">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <Link
          href="/merch"
          className="inline-flex min-h-[36px] touch-manipulation items-center gap-1 text-sm text-gray-500 hover:text-navy-900"
        >
          <ChevronLeft className="h-4 w-4" /> 回到限量周邊
        </Link>
      </div>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 sm:gap-10 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Gallery */}
        <ProductGallery images={images} name={product.name} soldOut={soldOut} />

        {/* Info */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-2">
            <p className="font-en text-[11px] font-bold tracking-[0.25em] text-coral">
              {CATEGORY_LABEL[product.category]} · HEYHEYDIVE
            </p>
            <h1 className="font-heading text-3xl font-bold text-navy-900 sm:text-4xl">
              {product.name}
            </h1>
            {product.name_en ? (
              <p className="font-en text-sm text-gray-500">{product.name_en}</p>
            ) : null}
            {product.name_ja ? (
              <p className="text-sm text-gray-500">{product.name_ja}</p>
            ) : null}
          </div>

          {product.badge || onSale || soldOut ? (
            <div className="flex flex-wrap gap-2">
              {product.badge ? (
                <span className="rounded-full bg-coral px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  {product.badge}
                </span>
              ) : null}
              {onSale ? (
                <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold">
                  特價 SALE
                </span>
              ) : null}
              {soldOut ? (
                <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-700">
                  暫無庫存
                </span>
              ) : null}
            </div>
          ) : null}

          {onSale ? (
            <p className="font-en text-xs text-gray-400 line-through">
              原價 NT$ {product.compare_at_price_twd!.toLocaleString()}
            </p>
          ) : null}

          {product.short_description ? (
            <p className="text-sm leading-relaxed text-gray-700">
              {product.short_description}
            </p>
          ) : null}

          <VariantPicker
            productName={product.name}
            basePriceTwd={product.price_twd}
            variants={product.variants}
            coverImage={product.cover_image}
          />

          {/* Features */}
          {product.features.length > 0 ? (
            <ul className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 sm:grid-cols-2">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-coral" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-white p-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-gray-400" /> 全台滿 NT$ 1,500 免運
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-gray-400" /> 7 日鑑賞
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gray-400" /> 少量設計、不一定補貨
            </span>
          </div>
        </div>
      </section>

      {/* Description */}
      {product.description ? (
        <section className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-12">
            <h2 className="mb-4 font-heading text-xl font-semibold text-navy-900">
              商品介紹
            </h2>
            <div className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {product.description}
            </div>
            {product.description_en ? (
              <details className="mt-6 text-sm">
                <summary className="cursor-pointer font-medium text-gray-500 hover:text-navy-900">
                  English description
                </summary>
                <div className="mt-2 whitespace-pre-line leading-relaxed text-gray-700">
                  {product.description_en}
                </div>
              </details>
            ) : null}
            {product.description_ja ? (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-medium text-gray-500 hover:text-navy-900">
                  日本語商品紹介
                </summary>
                <div className="mt-2 whitespace-pre-line leading-relaxed text-gray-700">
                  {product.description_ja}
                </div>
              </details>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Related */}
      {related.length > 0 ? (
        <section className="border-t border-gray-200 bg-off-white">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-heading text-xl font-semibold text-navy-900">
                你可能也會喜歡
              </h2>
              <Link
                href="/merch"
                className="font-en text-[11px] font-medium tracking-wider text-coral hover:underline"
              >
                VIEW ALL →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-8">
              {related.map((p) => (
                <RelatedCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function RelatedCard({product}: {product: MerchProduct}) {
  return (
    <Link
      href={`/merch/${product.slug}`}
      aria-label={`查看商品：${product.name}`}
      className="group block touch-manipulation overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition active:scale-[0.98] active:shadow-none hover:-translate-y-0.5 hover:border-coral hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {product.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.cover_image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="matte h-full w-full bg-gradient-to-br from-navy-900 to-coral/40" />
        )}
      </div>
      <div className="flex flex-col gap-1 px-3 py-3 sm:px-4 sm:py-4">
        <p className="font-en text-[10px] font-medium uppercase tracking-wider text-gray-400">
          {CATEGORY_LABEL[product.category]}
        </p>
        <h3 className="font-heading text-[15px] font-semibold leading-snug text-navy-900 group-hover:text-coral sm:text-sm">
          {product.name}
        </h3>
        <p className="font-en text-sm font-semibold text-navy-900 sm:text-xs">
          NT$ {product.price_twd.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
