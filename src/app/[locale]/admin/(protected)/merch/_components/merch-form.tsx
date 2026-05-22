'use client';

import {useActionState, useState} from 'react';
import {useFormStatus} from 'react-dom';
import Link from 'next/link';
import {Trash2, X} from 'lucide-react';
import {upsertMerchAction, deleteMerchAction, type MerchFormState} from '../actions';
import type {MerchProductWithVariants} from '@/lib/cms/types';
import {
  FieldLabel,
  FormError,
  Select,
  Textarea,
  TextInput
} from '@/components/admin/form-fields';
import {CoverImageField} from '@/components/admin/cover-image-field';
import {VariantsEditor} from './variants-editor';

const initial: MerchFormState = {error: null};

export function MerchForm({
  product,
  locale
}: {
  product?: MerchProductWithVariants | null;
  locale: string;
}) {
  const [state, formAction] = useActionState(upsertMerchAction, initial);
  const isEdit = !!product;
  const [gallery, setGallery] = useState<string[]>(product?.gallery ?? []);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-6"
      encType="multipart/form-data"
    >
      <input type="hidden" name="locale" value={locale} />
      {isEdit ? <input type="hidden" name="id" value={product!.id} /> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <FieldLabel
          label="Slug"
          required
          hint="網址用，全小寫加連字號，例如 tee-ocean-classic"
        >
          <TextInput
            name="slug"
            required
            defaultValue={product?.slug ?? ''}
            placeholder="tee-ocean-classic"
            pattern="[a-z0-9\-]+"
          />
        </FieldLabel>
        <FieldLabel label="狀態" required>
          <Select
            name="status"
            defaultValue={product?.status ?? 'draft'}
            options={[
              {value: 'draft', label: '草稿（前台不顯示）'},
              {value: 'active', label: '上架販售'},
              {value: 'sold_out', label: '已售完（仍顯示）'},
              {value: 'archived', label: '封存（前台不顯示）'}
            ]}
          />
        </FieldLabel>

        <FieldLabel label="商品名稱（中文）" required>
          <TextInput
            name="name"
            required
            defaultValue={product?.name ?? ''}
            placeholder="海洋藍經典 T-shirt"
          />
        </FieldLabel>
        <FieldLabel label="Product Name (English)">
          <TextInput
            name="name_en"
            defaultValue={product?.name_en ?? ''}
            placeholder="Ocean Blue Classic Tee"
          />
        </FieldLabel>
        <FieldLabel label="商品名 (日本語)">
          <TextInput
            name="name_ja"
            defaultValue={product?.name_ja ?? ''}
            placeholder="オーシャンブルー クラシック Tシャツ"
          />
        </FieldLabel>

        <FieldLabel label="分類" required>
          <Select
            name="category"
            defaultValue={product?.category ?? 'apparel'}
            options={[
              {value: 'apparel', label: '服飾 Apparel'},
              {value: 'accessory', label: '配件 Accessory'},
              {value: 'gear', label: '裝備 Gear'},
              {value: 'print', label: '印刷品 Print'},
              {value: 'other', label: '其他 Other'}
            ]}
          />
        </FieldLabel>
        <FieldLabel label="排序" hint="數字小越前面">
          <TextInput
            type="number"
            name="display_order"
            defaultValue={product?.display_order ?? 0}
          />
        </FieldLabel>

        <FieldLabel label="價格 (NT$)" required>
          <TextInput
            type="number"
            name="price_twd"
            required
            min={0}
            step={10}
            defaultValue={product?.price_twd ?? 0}
          />
        </FieldLabel>
        <FieldLabel label="原價 (NT$)" hint="留空＝沒有特價；有填會以刪除線顯示">
          <TextInput
            type="number"
            name="compare_at_price_twd"
            min={0}
            step={10}
            defaultValue={product?.compare_at_price_twd ?? ''}
            placeholder="留空"
          />
        </FieldLabel>

        <FieldLabel label="標籤" hint="例如：限量、新品、預購">
          <TextInput
            name="badge"
            defaultValue={product?.badge ?? ''}
            maxLength={12}
          />
        </FieldLabel>
        <FieldLabel
          label="顯示用備用庫存"
          hint="只在沒有任何規格時才會用到。有設定規格的話會以下面 variants 庫存總和為準。"
        >
          <TextInput
            type="number"
            name="stock"
            min={0}
            defaultValue={product?.stock ?? ''}
            placeholder="留空"
          />
        </FieldLabel>
      </section>

      <FieldLabel
        label="一句話介紹"
        hint="顯示在卡片與詳情頁標題下方（最多 200 字）"
      >
        <TextInput
          name="short_description"
          defaultValue={product?.short_description ?? ''}
          maxLength={200}
        />
      </FieldLabel>

      <FieldLabel label="詳細介紹（中文）">
        <Textarea
          name="description"
          rows={6}
          defaultValue={product?.description ?? ''}
        />
      </FieldLabel>
      <FieldLabel label="Description (English)">
        <Textarea
          name="description_en"
          rows={4}
          defaultValue={product?.description_en ?? ''}
        />
      </FieldLabel>
      <FieldLabel label="商品紹介 (日本語)">
        <Textarea
          name="description_ja"
          rows={4}
          defaultValue={product?.description_ja ?? ''}
        />
      </FieldLabel>

      <VariantsEditor initial={product?.variants ?? []} />

      <FieldLabel
        label="特色 / 規格"
        hint="一行一項，例如：220 GSM 純棉、台灣製造"
      >
        <Textarea
          name="features"
          rows={5}
          defaultValue={(product?.features ?? []).join('\n')}
          placeholder={`220 GSM 重磅純棉\n金線立體刺繡\n台灣製造`}
        />
      </FieldLabel>

      <CoverImageField defaultUrl={product?.cover_image} />

      <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div>
          <p className="text-sm font-medium text-navy-900">商品相簿（額外角度照）</p>
          <p className="text-xs text-gray-500">
            可上傳多張。已有圖片可刪除；新增以下方檔案輸入框選擇。
          </p>
        </div>

        {gallery.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((url, idx) => (
              <li key={url} className="relative">
                <input type="hidden" name="keep_gallery" value={url} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`gallery ${idx + 1}`}
                  className="aspect-square w-full rounded-md border border-gray-200 bg-white object-cover"
                />
                <button
                  type="button"
                  aria-label="移除這張"
                  onClick={() =>
                    setGallery((g) => g.filter((u) => u !== url))
                  }
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed border-gray-300 bg-white px-3 py-3 text-center text-xs text-gray-400">
            尚無相簿圖片
          </p>
        )}

        <label className="text-xs font-medium text-navy-900">
          新增相簿圖片
          <input
            type="file"
            name="gallery_files"
            multiple
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-navy-800"
          />
        </label>
      </section>

      <FormError error={state.error} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5">
        <Link
          href={`/${locale}/admin/merch`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          取消
        </Link>
        <div className="flex items-center gap-3">
          {isEdit ? <DeleteButton id={product!.id} locale={locale} /> : null}
          <SaveButton isEdit={isEdit} />
        </div>
      </div>
    </form>
  );
}

function SaveButton({isEdit}: {isEdit: boolean}) {
  const {pending} = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-coral px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
    >
      {pending ? '儲存中…' : isEdit ? '儲存變更' : '建立商品'}
    </button>
  );
}

function DeleteButton({id, locale}: {id: string; locale: string}) {
  return (
    <form
      action={deleteMerchAction}
      onSubmit={(e) => {
        if (!confirm('確定要刪除這個商品嗎？此操作無法復原。')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" /> 刪除
      </button>
    </form>
  );
}
