'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import Link from 'next/link';
import {upsertTripAction, deleteTripAction, type TripFormState} from '../actions';
import type {Trip} from '@/lib/cms/types';
import {
  FieldLabel,
  FormError,
  Select,
  Textarea,
  TextInput
} from '@/components/admin/form-fields';

const initial: TripFormState = {error: null};

export function TripForm({
  trip,
  locale
}: {
  trip?: Trip | null;
  locale: string;
}) {
  const [state, formAction] = useActionState(upsertTripAction, initial);
  const isEdit = !!trip;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      {isEdit ? <input type="hidden" name="id" value={trip!.id} /> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <FieldLabel label="Slug" required hint="網址用，建議全小寫加連字號，例如 ludao-4d3n">
          <TextInput
            name="slug"
            required
            defaultValue={trip?.slug ?? ''}
            placeholder="ludao-4d3n"
            pattern="[a-z0-9\-]+"
          />
        </FieldLabel>
        <FieldLabel label="狀態" required>
          <Select
            name="status"
            defaultValue={trip?.status ?? 'draft'}
            options={[
              {value: 'draft', label: '草稿 (公開頁面隱藏)'},
              {value: 'open', label: '開放報名'},
              {value: 'sold_out', label: '已售完'},
              {value: 'closed', label: '結束 / 隱藏'}
            ]}
          />
        </FieldLabel>

        <FieldLabel label="標題（中文）" required>
          <TextInput name="title" required defaultValue={trip?.title ?? ''} placeholder="綠島 4天3夜 海底溫泉潛旅" />
        </FieldLabel>
        <FieldLabel label="Title (English)" hint="可不填">
          <TextInput name="title_en" defaultValue={trip?.title_en ?? ''} placeholder="Ludao 4D3N — Hot-spring dive" />
        </FieldLabel>

        <FieldLabel label="目的地" required>
          <Select
            name="destination"
            defaultValue={trip?.destination ?? 'ludao'}
            options={[
              {value: 'ludao', label: '綠島 Ludao'},
              {value: 'lanyu', label: '蘭嶼 Lanyu'},
              {value: 'liuqiu', label: '小琉球 Liuqiu'},
              {value: 'kenting', label: '墾丁 Kenting'},
              {value: 'other', label: '其他'}
            ]}
          />
        </FieldLabel>
        <FieldLabel label="課程類型" required>
          <Select
            name="kind"
            defaultValue={trip?.kind ?? 'padi'}
            options={[
              {value: 'padi', label: 'PADI 水肺'},
              {value: 'aida', label: 'AIDA 自由潛水'},
              {value: 'experience', label: '體驗潛水'},
              {value: 'other', label: '其他'}
            ]}
          />
        </FieldLabel>

        <FieldLabel label="開始日期" required>
          <TextInput type="date" name="start_date" required defaultValue={trip?.start_date ?? ''} />
        </FieldLabel>
        <FieldLabel label="結束日期" required>
          <TextInput type="date" name="end_date" required defaultValue={trip?.end_date ?? ''} />
        </FieldLabel>

        <FieldLabel label="價格 (NT$)" required>
          <TextInput type="number" name="price_twd" required min={0} step={100} defaultValue={trip?.price_twd ?? 0} />
        </FieldLabel>
        <FieldLabel label="總名額 / 已開放名額">
          <div className="flex gap-2">
            <TextInput type="number" name="capacity" min={1} defaultValue={trip?.capacity ?? 10} placeholder="總額" />
            <TextInput type="number" name="available_seats" min={0} defaultValue={trip?.available_seats ?? 10} placeholder="剩餘" />
          </div>
        </FieldLabel>
      </section>

      <FieldLabel label="簡介（列表 / 卡片用一句話）" hint="例如：4天3夜 · 8 支氣瓶 · 6 個潛點">
        <TextInput name="short_description" defaultValue={trip?.short_description ?? ''} maxLength={200} />
      </FieldLabel>

      <FieldLabel label="詳細介紹（中文）" hint="支援多行文字，會顯示在 trip 詳情頁">
        <Textarea name="description" rows={6} defaultValue={trip?.description ?? ''} />
      </FieldLabel>

      <FieldLabel label="Description (English)">
        <Textarea name="description_en" rows={4} defaultValue={trip?.description_en ?? ''} />
      </FieldLabel>

      <FieldLabel label="封面圖片 URL" hint="先填 URL，未來支援上傳">
        <TextInput name="cover_image" type="url" defaultValue={trip?.cover_image ?? ''} placeholder="https://..." />
      </FieldLabel>

      <FormError error={state.error} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5">
        <Link
          href={`/${locale}/admin/trips`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          取消
        </Link>
        <div className="flex items-center gap-3">
          {isEdit ? <DeleteButton id={trip!.id} locale={locale} /> : null}
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
      {pending ? '儲存中…' : isEdit ? '儲存變更' : '建立行程'}
    </button>
  );
}

function DeleteButton({id, locale}: {id: string; locale: string}) {
  return (
    <form
      action={deleteTripAction}
      onSubmit={(e) => {
        if (!confirm('確定要刪除這個行程嗎？此操作無法復原。')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        刪除
      </button>
    </form>
  );
}
