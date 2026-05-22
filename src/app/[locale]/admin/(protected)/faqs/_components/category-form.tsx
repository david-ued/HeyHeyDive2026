'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import Link from 'next/link';
import {
  upsertFaqCategoryAction,
  deleteFaqCategoryAction,
  type FaqFormState
} from '../actions';
import type {FaqCategory} from '@/lib/cms/types';
import {FieldLabel, FormError, Select, TextInput} from '@/components/admin/form-fields';

const initial: FaqFormState = {error: null};

export function FaqCategoryForm({
  category,
  locale
}: {
  category?: FaqCategory | null;
  locale: string;
}) {
  const [state, formAction] = useActionState(upsertFaqCategoryAction, initial);
  const isEdit = !!category;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      {isEdit ? <input type="hidden" name="id" value={category!.id} /> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <FieldLabel label="Slug" required hint="網址用代號，小寫英數與「-」">
          <TextInput
            name="slug"
            required
            defaultValue={category?.slug ?? ''}
            pattern="[a-z0-9\-]+"
            placeholder="courses"
          />
        </FieldLabel>
        <FieldLabel label="狀態" required>
          <Select
            name="status"
            defaultValue={category?.status ?? 'open'}
            options={[
              {value: 'open', label: '上架'},
              {value: 'draft', label: '草稿'}
            ]}
          />
        </FieldLabel>

        <FieldLabel label="標題（中文）" required>
          <TextInput name="title" required defaultValue={category?.title ?? ''} placeholder="課程相關" />
        </FieldLabel>
        <FieldLabel label="Title (English)">
          <TextInput name="title_en" defaultValue={category?.title_en ?? ''} placeholder="Courses" />
        </FieldLabel>
        <FieldLabel label="タイトル (日本語)">
          <TextInput name="title_ja" defaultValue={category?.title_ja ?? ''} placeholder="コース" />
        </FieldLabel>

        <FieldLabel label="標記 Kicker" hint="顯示於 tab 上方的英文小標">
          <TextInput name="kicker" defaultValue={category?.kicker ?? ''} placeholder="COURSES" />
        </FieldLabel>
        <FieldLabel label="顯示順序" hint="數字小的排前面">
          <TextInput
            type="number"
            name="display_order"
            min={0}
            step={1}
            defaultValue={category?.display_order ?? 0}
          />
        </FieldLabel>
      </section>

      <FormError error={state.error} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5">
        <Link
          href={`/${locale}/admin/faqs`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          取消
        </Link>
        <div className="flex items-center gap-3">
          {isEdit ? <DeleteButton id={category!.id} locale={locale} /> : null}
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
      {pending ? '儲存中…' : isEdit ? '儲存變更' : '建立分類'}
    </button>
  );
}

function DeleteButton({id, locale}: {id: string; locale: string}) {
  return (
    <form
      action={deleteFaqCategoryAction}
      onSubmit={(e) => {
        if (!confirm('確定要刪除這個分類嗎？分類底下的所有問題會一併刪除。')) e.preventDefault();
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
