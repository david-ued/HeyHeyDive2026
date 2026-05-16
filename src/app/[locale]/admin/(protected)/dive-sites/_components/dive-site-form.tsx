'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import Link from 'next/link';
import {upsertDiveSiteAction, deleteDiveSiteAction, type DiveSiteFormState} from '../actions';
import type {DiveSite} from '@/lib/cms/types';
import {FieldLabel, FormError, Select, Textarea, TextInput} from '@/components/admin/form-fields';

const initial: DiveSiteFormState = {error: null};

export function DiveSiteForm({site, locale}: {site?: DiveSite | null; locale: string}) {
  const [state, formAction] = useActionState(upsertDiveSiteAction, initial);
  const isEdit = !!site;
  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      {isEdit ? <input type="hidden" name="id" value={site!.id} /> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <FieldLabel label="Slug" required hint="網址用，建議 ludao / lanyu / liuqiu">
          <TextInput name="slug" required defaultValue={site?.slug ?? ''} pattern="[a-z0-9\-]+" />
        </FieldLabel>
        <FieldLabel label="狀態" required>
          <Select
            name="status"
            defaultValue={site?.status ?? 'draft'}
            options={[
              {value: 'draft', label: '草稿'},
              {value: 'open', label: '上架'},
              {value: 'closed', label: '隱藏'}
            ]}
          />
        </FieldLabel>

        <FieldLabel label="名稱（中文）" required>
          <TextInput name="name" required defaultValue={site?.name ?? ''} placeholder="綠島" />
        </FieldLabel>
        <FieldLabel label="Name (English)">
          <TextInput name="name_en" defaultValue={site?.name_en ?? ''} placeholder="Ludao Island" />
        </FieldLabel>

        <FieldLabel label="所在地區">
          <TextInput name="region" defaultValue={site?.region ?? ''} placeholder="台東·綠島" />
        </FieldLabel>
        <FieldLabel label="顯示排序" hint="數字越小越靠前">
          <TextInput type="number" name="display_order" defaultValue={site?.display_order ?? 0} />
        </FieldLabel>

        <FieldLabel label="水溫">
          <TextInput name="temp" defaultValue={site?.temp ?? ''} placeholder="26–28°C" />
        </FieldLabel>
        <FieldLabel label="能見度">
          <TextInput name="visibility" defaultValue={site?.visibility ?? ''} placeholder="20–30m" />
        </FieldLabel>
      </section>

      <FieldLabel label="景點介紹（中文）">
        <Textarea name="intro" rows={6} defaultValue={site?.intro ?? ''} />
      </FieldLabel>
      <FieldLabel label="Intro (English)">
        <Textarea name="intro_en" rows={4} defaultValue={site?.intro_en ?? ''} />
      </FieldLabel>
      <FieldLabel label="封面圖片 URL">
        <TextInput name="cover_image" type="url" defaultValue={site?.cover_image ?? ''} />
      </FieldLabel>

      <FormError error={state.error} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5">
        <Link
          href={`/${locale}/admin/dive-sites`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          取消
        </Link>
        <div className="flex items-center gap-3">
          {isEdit ? <DeleteButton id={site!.id} locale={locale} /> : null}
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
      {pending ? '儲存中…' : isEdit ? '儲存變更' : '建立景點'}
    </button>
  );
}

function DeleteButton({id, locale}: {id: string; locale: string}) {
  return (
    <form
      action={deleteDiveSiteAction}
      onSubmit={(e) => {
        if (!confirm('確定要刪除這個景點嗎？')) e.preventDefault();
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
