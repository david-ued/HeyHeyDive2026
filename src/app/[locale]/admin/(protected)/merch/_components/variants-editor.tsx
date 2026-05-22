'use client';

import {useMemo, useState} from 'react';
import {Plus, Trash2} from 'lucide-react';
import type {MerchVariant} from '@/lib/cms/types';

type Row = {
  id: string | null;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price_twd: string;
  display_order: number;
  status: 'active' | 'sold_out' | 'archived';
};

function toRow(v: MerchVariant): Row {
  return {
    id: v.id,
    size: v.size ?? '',
    color: v.color ?? '',
    sku: v.sku ?? '',
    stock: v.stock,
    price_twd: v.price_twd == null ? '' : String(v.price_twd),
    display_order: v.display_order,
    status: v.status
  };
}

function emptyRow(order: number): Row {
  return {
    id: null,
    size: '',
    color: '',
    sku: '',
    stock: 0,
    price_twd: '',
    display_order: order,
    status: 'active'
  };
}

export function VariantsEditor({initial}: {initial: MerchVariant[]}) {
  const [rows, setRows] = useState<Row[]>(
    initial.length > 0 ? initial.map(toRow) : [emptyRow(0)]
  );

  const serialized = useMemo(
    () =>
      JSON.stringify(
        rows.map((r, i) => ({
          id: r.id,
          size: r.size.trim() || null,
          color: r.color.trim() || null,
          sku: r.sku.trim() || null,
          stock: Number.isFinite(Number(r.stock)) ? Math.max(0, Math.trunc(Number(r.stock))) : 0,
          price_twd: r.price_twd.trim() === '' ? null : Number(r.price_twd),
          display_order: r.display_order || i,
          status: r.status
        }))
      ),
    [rows]
  );

  const totalStock = rows
    .filter((r) => r.status !== 'archived')
    .reduce((sum, r) => sum + (Number(r.stock) || 0), 0);

  function update(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? {...r, ...patch} : r)));
  }

  function add() {
    setRows((prev) => [...prev, emptyRow(prev.length)]);
  }

  function remove(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <input type="hidden" name="variants_json" value={serialized} />

      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-navy-900">
            規格與庫存（Variants）
          </p>
          <p className="text-xs text-gray-500">
            每組「尺寸 × 顏色」是一個 variant，可設獨立庫存、SKU、售價。沒有變化的商品也至少保留一列。
          </p>
        </div>
        <div className="text-xs text-gray-600">
          總庫存（不含封存）：
          <span className="ml-1 font-en font-semibold text-navy-900">{totalStock}</span>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-3 py-2 w-[140px]">尺寸</th>
              <th className="px-3 py-2 w-[140px]">顏色</th>
              <th className="px-3 py-2 w-[120px]">SKU</th>
              <th className="px-3 py-2 w-[90px]">庫存</th>
              <th className="px-3 py-2 w-[110px]">價格 (覆蓋)</th>
              <th className="px-3 py-2 w-[120px]">狀態</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={r.size}
                    onChange={(e) => update(i, {size: e.target.value})}
                    placeholder="M"
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={r.color}
                    onChange={(e) => update(i, {color: e.target.value})}
                    placeholder="海洋藍"
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={r.sku}
                    onChange={(e) => update(i, {sku: e.target.value})}
                    placeholder="TEE-OCN-M"
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 font-en text-xs focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min={0}
                    value={r.stock}
                    onChange={(e) =>
                      update(i, {
                        stock: Math.max(0, Math.trunc(Number(e.target.value) || 0))
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 font-en text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min={0}
                    value={r.price_twd}
                    onChange={(e) => update(i, {price_twd: e.target.value})}
                    placeholder="留空"
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 font-en text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                  />
                </td>
                <td className="px-2 py-2">
                  <select
                    value={r.status}
                    onChange={(e) =>
                      update(i, {status: e.target.value as Row['status']})
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                  >
                    <option value="active">上架</option>
                    <option value="sold_out">售完</option>
                    <option value="archived">封存</option>
                  </select>
                </td>
                <td className="px-2 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40"
                    disabled={rows.length === 1}
                  >
                    <Trash2 className="h-3 w-3" /> 移除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-md border border-coral/40 bg-coral/5 px-3 py-1.5 text-xs font-medium text-coral hover:bg-coral/10"
        >
          <Plus className="h-3.5 w-3.5" /> 新增規格
        </button>
        <p className="text-xs text-gray-400">
          提示：尺寸與顏色都留空＝預設規格（適用沒有變化的商品）
        </p>
      </div>
    </section>
  );
}
