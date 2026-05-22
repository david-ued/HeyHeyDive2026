'use client';

import {useEffect, useMemo, useState} from 'react';
import {Mail, MessageCircle, Minus, Phone, Plus, Sparkles} from 'lucide-react';
import type {MerchVariant} from '@/lib/cms/types';

type Selection = {size: string | null; color: string | null};

export function VariantPicker({
  productName,
  basePriceTwd,
  variants,
  coverImage
}: {
  productName: string;
  basePriceTwd: number;
  variants: MerchVariant[];
  coverImage?: string | null;
}) {
  const active = useMemo(
    () => variants.filter((v) => v.status !== 'archived'),
    [variants]
  );

  const sizeOptions = useMemo(
    () => collectOptions(active, 'size'),
    [active]
  );
  const colorOptions = useMemo(
    () => collectOptions(active, 'color'),
    [active]
  );

  const hasSize = sizeOptions.length > 0;
  const hasColor = colorOptions.length > 0;

  // Auto-pick if there's only one possible value on a dimension.
  const [selection, setSelection] = useState<Selection>(() => ({
    size: hasSize ? (sizeOptions.length === 1 ? sizeOptions[0] : null) : null,
    color: hasColor ? (colorOptions.length === 1 ? colorOptions[0] : null) : null
  }));

  // If neither dimension exists, use the lone default variant directly.
  const defaultVariant =
    !hasSize && !hasColor && active.length > 0 ? active[0] : null;

  const matched = useMemo(() => {
    if (defaultVariant) return defaultVariant;
    return active.find(
      (v) =>
        (v.size ?? null) === selection.size &&
        (v.color ?? null) === selection.color
    );
  }, [active, defaultVariant, selection]);

  const fullySelected = !!matched;
  const stock = matched?.stock ?? 0;
  const priceTwd = matched?.price_twd ?? basePriceTwd;

  const soldOut = matched ? matched.status === 'sold_out' || stock === 0 : false;

  // Quantity selector — capped at the selected variant's stock. We clamp every
  // time the variant changes so switching from a 10-in-stock to a 2-in-stock
  // variant doesn't leave qty=10 hanging.
  const [qty, setQty] = useState(1);
  useEffect(() => {
    if (soldOut) {
      setQty(0);
    } else {
      setQty((prev) => Math.max(1, Math.min(prev || 1, stock || 1)));
    }
  }, [matched?.id, stock, soldOut]);
  const qtyCap = Math.max(0, stock);
  const canDecrease = qty > 1;
  const canIncrease = qty < qtyCap;

  function stockOfCombo(size: string | null, color: string | null) {
    return active
      .filter((v) => (v.size ?? null) === size && (v.color ?? null) === color)
      .reduce((sum, v) => (v.status === 'sold_out' ? sum : sum + v.stock), 0);
  }

  function maxStockForSize(size: string | null) {
    if (!hasColor) return stockOfCombo(size, null);
    return colorOptions.reduce(
      (max, c) => Math.max(max, stockOfCombo(size, c)),
      0
    );
  }

  function maxStockForColor(color: string | null) {
    if (!hasSize) return stockOfCombo(null, color);
    return sizeOptions.reduce(
      (max, s) => Math.max(max, stockOfCombo(s, color)),
      0
    );
  }

  const includeQty = !soldOut && qty > 0;
  const ctaSubject = encodeURIComponent(
    fullySelected
      ? `[周邊詢購] ${productName}` +
          (selection.size ? ` · ${selection.size}` : '') +
          (selection.color ? ` · ${selection.color}` : '') +
          (includeQty ? ` × ${qty} 件` : '')
      : `[周邊詢購] ${productName}`
  );
  const lineTotal = includeQty ? priceTwd * qty : priceTwd;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3 font-en">
        <p className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-navy-900">
            NT$ {priceTwd.toLocaleString()}
          </span>
          {includeQty && qty > 1 ? (
            <span className="text-xs text-gray-500">／件</span>
          ) : null}
        </p>
        {includeQty && qty > 1 ? (
          <p className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              小計
            </span>
            <span className="ml-2 text-base font-semibold text-navy-900">
              NT$ {lineTotal.toLocaleString()}
            </span>
          </p>
        ) : null}
      </div>

      {hasSize ? (
        <PickerRow
          label="尺寸"
          required
          options={sizeOptions.map((s) => ({
            value: s,
            stock: maxStockForSize(s)
          }))}
          value={selection.size}
          onPick={(v) => setSelection((prev) => ({...prev, size: v}))}
        />
      ) : null}

      {hasColor ? (
        <PickerRow
          label="顏色"
          required
          options={colorOptions.map((c) => ({
            value: c,
            stock: maxStockForColor(c)
          }))}
          value={selection.color}
          onPick={(v) => setSelection((prev) => ({...prev, color: v}))}
        />
      ) : null}

      {/* Stock indicator */}
      {fullySelected ? (
        <StockLine stock={stock} soldOut={soldOut} sku={matched?.sku ?? null} />
      ) : (
        <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          請先選擇{[hasSize ? '尺寸' : null, hasColor ? '顏色' : null]
            .filter(Boolean)
            .join(' 與 ')}查看庫存
        </p>
      )}

      {/* Quantity stepper — only shows when a buyable variant is selected */}
      {fullySelected && !soldOut ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            數量
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="減少 1 件"
              onClick={() => canDecrease && setQty((n) => n - 1)}
              disabled={!canDecrease}
              className="grid h-11 w-11 touch-manipulation place-items-center rounded-full border border-gray-300 bg-white text-navy-900 transition active:scale-[0.94] disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={qtyCap}
              value={qty}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isFinite(n)) return;
                setQty(Math.max(1, Math.min(qtyCap, Math.trunc(n))));
              }}
              className="h-11 w-16 rounded-md border border-gray-300 bg-white text-center font-en text-base font-semibold text-navy-900 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
            />
            <button
              type="button"
              aria-label="增加 1 件"
              onClick={() => canIncrease && setQty((n) => n + 1)}
              disabled={!canIncrease}
              className="grid h-11 w-11 touch-manipulation place-items-center rounded-full border border-gray-300 bg-white text-navy-900 transition active:scale-[0.94] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="ml-1 text-[11px] text-gray-400">
              / 最多 {qtyCap}
            </span>
          </div>
        </div>
      ) : null}

      {/* CTAs */}
      <div className="flex flex-col gap-2 rounded-lg border border-coral/30 bg-coral/5 p-4">
        <p className="text-xs text-coral">
          <Sparkles className="mr-1 inline h-3.5 w-3.5 -translate-y-0.5" />
          {soldOut
            ? '此規格暫無庫存，可 LINE 我們加入候補名單。'
            : '目前不開放線上下單，請透過 LINE 或 Email 直接詢購、約取貨。'}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <a
            href="https://line.me/R/ti/p/@heydive"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-1.5 rounded-md bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98] hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" />
            {soldOut ? 'LINE 加候補' : 'LINE 詢購'}
          </a>
          <a
            href={`mailto:hello@heyheydive.com?subject=${ctaSubject}`}
            className="inline-flex min-h-[48px] touch-manipulation items-center justify-center gap-1.5 rounded-md border border-navy-900 bg-white px-4 py-3 text-sm font-semibold text-navy-900 transition active:scale-[0.98] hover:bg-navy-900 hover:text-white"
          >
            <Mail className="h-4 w-4" /> Email 詢購
          </a>
        </div>
        <a
          href="tel:+886989123456"
          className="inline-flex min-h-[40px] touch-manipulation items-center justify-center gap-1.5 text-xs text-navy-900 hover:underline"
        >
          <Phone className="h-3.5 w-3.5" /> +886 989 123 456
        </a>
        {fullySelected ? (
          <p className="mt-1 font-en text-[11px] text-gray-500">
            選擇規格 ·
            {selection.size ? ` ${selection.size}` : ''}
            {selection.color ? ` · ${selection.color}` : ''}
            {includeQty ? ` × ${qty}` : ''}
          </p>
        ) : null}
      </div>

      {/* Mobile-only sticky bottom inquiry bar — always reachable while scrolling */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-3 py-2.5 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.12)] backdrop-blur md:hidden"
        style={{paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))'}}
      >
        <div className="flex items-center gap-3">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt=""
              aria-hidden
              className="h-12 w-12 shrink-0 rounded-md object-cover ring-1 ring-gray-200"
            />
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-[11px] text-gray-500">
              {fullySelected
                ? ([selection.size, selection.color].filter(Boolean).join(' · ') ||
                    '預設規格') + (includeQty ? ` × ${qty}` : '')
                : '請選擇規格'}
            </p>
            <p className="font-en text-base font-bold text-navy-900">
              NT$ {(includeQty ? lineTotal : priceTwd).toLocaleString()}
            </p>
          </div>
          <a
            href="https://line.me/R/ti/p/@heydive"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-[44px] shrink-0 touch-manipulation items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.97] hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" />
            {soldOut ? '候補' : '詢購'}
          </a>
        </div>
      </div>

      {/* Spacer to keep page bottom content visible above the sticky bar */}
      <div aria-hidden className="h-16 md:hidden" />
    </div>
  );
}

function collectOptions(
  variants: MerchVariant[],
  key: 'size' | 'color'
): string[] {
  const seen = new Map<string, number>();
  for (const v of variants) {
    const val = v[key];
    if (!val) continue;
    seen.set(val, (seen.get(val) ?? 1_000_000) - 1);
  }
  return Array.from(seen.keys()).sort();
}

function StockLine({
  stock,
  soldOut,
  sku
}: {
  stock: number;
  soldOut: boolean;
  sku: string | null;
}) {
  const tone = soldOut
    ? 'text-coral'
    : stock < 5
      ? 'text-amber-600'
      : 'text-emerald-700';
  const label = soldOut
    ? '已售完，可加入候補'
    : stock < 5
      ? `剩 ${stock} 件，手刀來訊`
      : `庫存 ${stock} 件`;
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs">
      <span className={`font-medium ${tone}`}>{label}</span>
      {sku ? (
        <span className="font-en text-[10px] text-gray-400">SKU {sku}</span>
      ) : null}
    </div>
  );
}

function PickerRow({
  label,
  required,
  options,
  value,
  onPick
}: {
  label: string;
  required?: boolean;
  options: Array<{value: string; stock: number}>;
  value: string | null;
  onPick: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
        {required ? <span className="ml-0.5 text-coral">*</span> : null}
        {value ? <span className="ml-2 text-navy-900">{value}</span> : null}
      </p>
      <ul className="flex flex-wrap gap-2.5">
        {options.map((opt) => {
          const active = value === opt.value;
          const empty = opt.stock === 0;
          // Use a button that submits no value — we use the state-driven approach,
          // and hint visually with strikethrough when out of stock everywhere.
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => onPick(opt.value)}
                aria-pressed={active}
                className={`relative inline-flex min-h-[44px] min-w-[60px] touch-manipulation items-center justify-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-medium transition active:scale-[0.96] ${
                  active
                    ? 'border-coral bg-coral text-white shadow-sm'
                    : empty
                      ? 'border-gray-200 bg-gray-50 text-gray-400'
                      : 'border-gray-300 bg-white text-navy-900 hover:border-coral hover:text-coral'
                }`}
              >
                <span className={empty && !active ? 'line-through' : ''}>
                  {opt.value}
                </span>
                {empty && !active ? (
                  <span className="font-en text-[9px] uppercase tracking-wider opacity-70">
                    sold out
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
