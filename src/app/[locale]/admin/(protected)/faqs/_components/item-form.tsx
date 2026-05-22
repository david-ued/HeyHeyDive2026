'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import Link from 'next/link';
import {
  upsertFaqItemAction,
  deleteFaqItemAction,
  type FaqFormState
} from '../actions';
import type {FaqCategory, FaqItem} from '@/lib/cms/types';
import {FieldLabel, FormError, Select, Textarea, TextInput} from '@/components/admin/form-fields';

const initial: FaqFormState = {error: null};

export function FaqItemForm({
  item,
  categories,
  defaultCategoryId,
  locale
}: {
  item?: FaqItem | null;
  categories: FaqCategory[];
  defaultCategoryId?: string;
  locale: string;
}) {
  const [state, formAction] = useActionState(upsertFaqItemAction, initial);
  const isEdit = !!item;
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: `${c.title}${c.status === 'draft' ? '（草稿）' : ''}`
  }));
  const selectedCategory =
    item?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? '';

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      {isEdit ? <input type="hidden" name="id" value={item!.id} /> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <FieldLabel label="分類" required>
          <Select
            name="category_id"
            defaultValue={selectedCategory}
            options={categoryOptions}
            required
          />
        </FieldLabel>
        <FieldLabel label="狀態" required>
          <Select
            name="status"
            defaultValue={item?.status ?? 'open'}
            options={[
              {value: 'open', label: '上架'},
              {value: 'draft', label: '草稿'}
            ]}
          />
        </FieldLabel>
      </section>

      <FieldLabel label="顯示順序" hint="同分類中，數字小的排前面">
        <TextInput
          type="number"
          name="display_order"
          min={0}
          step={1}
          defaultValue={item?.display_order ?? 0}
          className="md:max-w-xs"
        />
      </FieldLabel>

      <section className="grid gap-4 md:grid-cols-3">
        <FieldLabel label="問題（中文）" required>
          <TextInput name="question" required defaultValue={item?.question ?? ''} />
        </FieldLabel>
        <FieldLabel label="Question (English)">
          <TextInput name="question_en" defaultValue={item?.question_en ?? ''} />
        </FieldLabel>
        <FieldLabel label="質問 (日本語)">
          <TextInput name="question_ja" defaultValue={item?.question_ja ?? ''} />
        </FieldLabel>
      </section>

      <FieldLabel label="答覆（中文）" required hint="可以多行；空行會在前台轉成段落">
        <Textarea name="answer" rows={6} required defaultValue={item?.answer ?? ''} />
      </FieldLabel>
      <FieldLabel label="Answer (English)">
        <Textarea name="answer_en" rows={6} defaultValue={item?.answer_en ?? ''} />
      </FieldLabel>
      <FieldLabel label="回答 (日本語)">
        <Textarea name="answer_ja" rows={6} defaultValue={item?.answer_ja ?? ''} />
      </FieldLabel>

      <FormError error={state.error} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5">
        <Link
          href={`/${locale}/admin/faqs`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          取消
        </Link>
        <div className="flex items-center gap-3">
          {isEdit ? <DeleteButton id={item!.id} locale={locale} /> : null}
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
      {pending ? '儲存中…' : isEdit ? '儲存變更' : '建立問題'}
    </button>
  );
}

function DeleteButton({id, locale}: {id: string; locale: string}) {
  return (
    <form
      action={deleteFaqItemAction}
      onSubmit={(e) => {
        if (!confirm('確定要刪除這個問題嗎？')) e.preventDefault();
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
