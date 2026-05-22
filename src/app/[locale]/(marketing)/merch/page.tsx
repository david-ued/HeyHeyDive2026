import {ArrowRight, MessageCircle, ShoppingBag, Sparkles} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {listPublicMerchProducts} from '@/lib/cms/queries';
import type {MerchProduct} from '@/lib/cms/types';

export const dynamic = 'force-dynamic';

const CATEGORY_LABEL: Record<string, string> = {
  apparel: '服飾',
  accessory: '配件',
  gear: '裝備',
  print: '印刷品',
  other: '其他'
};

const CATEGORY_ORDER = ['apparel', 'accessory', 'gear', 'print', 'other'] as const;

export default async function MerchPage() {
  const products = await listPublicMerchProducts();

  if (products.length === 0) {
    return <EmptyStorefront />;
  }

  // Group by category for the filter chips; keep "all" first.
  const categories = CATEGORY_ORDER.filter((cat) =>
    products.some((p) => p.category === cat)
  );

  return (
    <div className="bg-off-white text-ink">
      {/* Hero */}
      <section className="matte matte-soft matte-strong relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-navy-900 via-navy-800 to-coral/70 text-white">
        <div
          aria-hidden
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-coral/40 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-6 py-16 sm:py-20">
          <p className="font-en text-[11px] font-bold tracking-[0.3em] text-gold">
            HEYHEYDIVE · MERCH 2026
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
            限量周邊
            <span className="block font-en text-lg font-medium tracking-wider text-white/80 sm:text-xl">
              Take a piece of the sea home.
            </span>
          </h1>
          <p className="max-w-xl text-sm text-white/80 sm:text-base">
            從棉 T、海灘巾到貼紙包，每件都是少量設計。產品照僅供參考、實際以拍攝為準。
            目前不開放線上下單，看到喜歡的可以直接 LINE 我們報名取貨。
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-white/90">
              <Sparkles className="h-3.5 w-3.5" /> 共 {products.length} 件商品上架中
            </span>
            <a
              href="https://line.me/R/ti/p/@heydive"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-semibold text-navy-900 hover:bg-gold"
            >
              <MessageCircle className="h-3.5 w-3.5" /> LINE 客服 @heydive
            </a>
          </div>
        </div>
      </section>

      {/* Filter chips (CSS-only "all" view; per-category anchor links) */}
      <section className="sticky top-14 z-30 border-b border-gray-200 bg-white/95 backdrop-blur md:top-[60px]">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 sm:py-4">
          <span className="inline-flex shrink-0 items-center rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-white">
            全部商品 · {products.length}
          </span>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            return (
              <a
                key={cat}
                href={`#cat-${cat}`}
                className="inline-flex shrink-0 items-center rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition active:scale-[0.96] hover:border-coral hover:text-coral"
              >
                {CATEGORY_LABEL[cat]} · {count}
              </a>
            );
          })}
        </div>
      </section>

      {/* Products grid by category */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {categories.map((cat) => {
          const items = products.filter((p) => p.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} id={`cat-${cat}`} className="mb-12 scroll-mt-24">
              <div className="mb-5 flex items-baseline justify-between">
                <h2 className="font-heading text-xl font-semibold text-navy-900 sm:text-2xl">
                  {CATEGORY_LABEL[cat]}
                </h2>
                <p className="font-en text-[11px] font-medium tracking-wider text-gray-400">
                  {items.length} ITEMS
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom contact strip */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center">
          <p className="font-heading text-lg font-semibold text-navy-900">
            想要的尺寸缺貨？想客製潛旅伴手禮？
          </p>
          <p className="max-w-xl text-sm text-gray-600">
            數量有限、補貨不一定，找不到的時候直接 LINE 我們，或 email
            hello@heyheydive.com，工作人員會幫你查最新狀況。
          </p>
          <a
            href="https://line.me/R/ti/p/@heydive"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" /> LINE 詢購 @heydive
          </a>
        </div>
      </section>
    </div>
  );
}

function ProductCard({product}: {product: MerchProduct}) {
  const onSale =
    product.compare_at_price_twd && product.compare_at_price_twd > product.price_twd;
  // product.stock is auto-synced from the variants table (see admin upsert flow).
  // Treat null as "no stock counter" so we don't render a stale "0 件" label.
  const stockKnown = product.stock != null;
  const soldOut =
    product.status === 'sold_out' || (stockKnown && product.stock === 0);
  const lowStock = stockKnown && !soldOut && product.stock! > 0 && product.stock! < 5;

  return (
    <Link
      href={`/merch/${product.slug}`}
      aria-label={`查看商品：${product.name}`}
      className="group block touch-manipulation overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition active:scale-[0.98] active:shadow-none hover:-translate-y-0.5 hover:border-coral hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.cover_image}
            alt={product.name}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
              soldOut ? 'grayscale opacity-70' : ''
            }`}
          />
        ) : (
          <div className="matte flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-900 to-coral/40 text-white">
            <ShoppingBag className="h-10 w-10 opacity-70" />
          </div>
        )}
        {/* Quick-view second-image swap if gallery exists */}
        {product.gallery?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.gallery[0]}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
        ) : null}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.badge ? (
            <span className="rounded-full bg-coral px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
              {product.badge}
            </span>
          ) : null}
          {onSale ? (
            <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold shadow-sm">
              SALE
            </span>
          ) : null}
        </div>

        {soldOut ? (
          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
            售完
          </span>
        ) : lowStock ? (
          <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
            剩 {product.stock}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 px-3 py-3 sm:px-4 sm:py-4">
        <p className="font-en text-[10px] font-medium uppercase tracking-wider text-gray-400">
          {CATEGORY_LABEL[product.category]}
        </p>
        <h3 className="font-heading text-[15px] font-semibold leading-snug text-navy-900 group-hover:text-coral sm:text-base">
          {product.name}
        </h3>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <p className="flex items-baseline gap-2 font-en">
            <span className="text-base font-semibold text-navy-900 sm:text-sm">
              NT$ {product.price_twd.toLocaleString()}
            </span>
            {onSale ? (
              <span className="text-xs text-gray-400 line-through">
                NT$ {product.compare_at_price_twd!.toLocaleString()}
              </span>
            ) : null}
          </p>
          <span
            aria-hidden
            className="font-en text-[10px] font-semibold tracking-wider text-coral opacity-70 group-hover:opacity-100"
          >
            查看 →
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyStorefront() {
  return (
    <section className="grid min-h-[60vh] place-items-center bg-off-white px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-coral/10">
          <ShoppingBag className="h-8 w-8 text-coral" />
        </span>
        <h1 className="font-heading text-2xl font-bold text-navy-900">
          周邊整理中
        </h1>
        <p className="max-w-md text-sm text-gray-500">
          新一季的 HeyHeyDive 限量周邊正在拍攝整理中，下水之外，把海帶回家。敬請期待！
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          回首頁 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
