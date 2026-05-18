'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import Link from 'next/link';
import {upsertCourseAction, deleteCourseAction, type CourseFormState} from '../actions';
import type {Course} from '@/lib/cms/types';
import {
  CoverPreview,
  FieldLabel,
  FileInput,
  FormError,
  JsonField,
  Select,
  Textarea,
  TextInput
} from '@/components/admin/form-fields';

const initial: CourseFormState = {error: null};

export function CourseForm({course, locale}: {course?: Course | null; locale: string}) {
  const [state, formAction] = useActionState(upsertCourseAction, initial);
  const isEdit = !!course;
  return (
    <form action={formAction} className="flex flex-col gap-6" encType="multipart/form-data">
      <input type="hidden" name="locale" value={locale} />
      {isEdit ? <input type="hidden" name="id" value={course!.id} /> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <FieldLabel label="Slug" required>
          <TextInput name="slug" required defaultValue={course?.slug ?? ''} pattern="[a-z0-9\-]+" placeholder="aida-2" />
        </FieldLabel>
        <FieldLabel label="狀態" required>
          <Select
            name="status"
            defaultValue={course?.status ?? 'draft'}
            options={[
              {value: 'draft', label: '草稿'},
              {value: 'open', label: '上架'},
              {value: 'closed', label: '隱藏'}
            ]}
          />
        </FieldLabel>

        <FieldLabel label="系統" required>
          <Select
            name="system"
            defaultValue={course?.system ?? 'aida'}
            options={[
              {value: 'aida', label: 'AIDA 自由潛水'},
              {value: 'padi', label: 'PADI 水肺'},
              {value: 'other', label: '其他'}
            ]}
          />
        </FieldLabel>
        <FieldLabel label="等級 / 課程代號" required hint="例如 AIDA2, OWD, AOW">
          <TextInput name="level" required defaultValue={course?.level ?? ''} />
        </FieldLabel>

        <FieldLabel label="標題（中文）" required>
          <TextInput name="title" required defaultValue={course?.title ?? ''} placeholder="AIDA 2 自由潛水" />
        </FieldLabel>
        <FieldLabel label="Title (English)">
          <TextInput name="title_en" defaultValue={course?.title_en ?? ''} placeholder="AIDA 2 Freediver" />
        </FieldLabel>

        <FieldLabel label="課程時長">
          <TextInput name="duration" defaultValue={course?.duration ?? ''} placeholder="3 天" />
        </FieldLabel>
        <FieldLabel label="班級人數">
          <TextInput name="group_size" defaultValue={course?.group_size ?? ''} placeholder="1 教練 : 4 學員" />
        </FieldLabel>

        <FieldLabel label="先修條件">
          <TextInput name="prerequisite" defaultValue={course?.prerequisite ?? ''} placeholder="12 歲以上 · 會游泳" />
        </FieldLabel>
        <FieldLabel label="價格 (NT$)">
          <TextInput type="number" name="price_twd" min={0} step={100} defaultValue={course?.price_twd ?? 0} />
        </FieldLabel>
      </section>

      <FieldLabel label="課程介紹（中文）">
        <Textarea name="description" rows={6} defaultValue={course?.description ?? ''} />
      </FieldLabel>
      <FieldLabel label="Description (English)">
        <Textarea name="description_en" rows={4} defaultValue={course?.description_en ?? ''} />
      </FieldLabel>
      <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-navy-900">封面圖片</p>
        <FieldLabel label="上傳檔案" hint="JPG / PNG，最大 5MB">
          <FileInput name="cover_image_file" accept="image/*" />
        </FieldLabel>
        <FieldLabel label="或貼上圖片 URL">
          <TextInput name="cover_image" type="url" defaultValue={course?.cover_image ?? ''} />
        </FieldLabel>
        <CoverPreview src={course?.cover_image} />
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div>
          <p className="text-sm font-medium text-navy-900">深層內容（JSON）</p>
          <p className="mt-1 text-xs text-gray-500">
            選填。可放 curriculum、includes、equipment、faq 等。詳情頁有讀到對應 key 時，會以這裡為準。
          </p>
        </div>
        <FieldLabel label="content_zh">
          <JsonField name="content_zh" defaultValue={course?.content_zh} rows={10} placeholder='{"curriculum": {"steps": {"theory": {"title": "Day 1 — 理論", "body": "..."}}}}' />
        </FieldLabel>
        <FieldLabel label="content_en">
          <JsonField name="content_en" defaultValue={course?.content_en} rows={8} />
        </FieldLabel>
      </section>

      <FormError error={state.error} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5">
        <Link
          href={`/${locale}/admin/courses`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          取消
        </Link>
        <div className="flex items-center gap-3">
          {isEdit ? <DeleteButton id={course!.id} locale={locale} /> : null}
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
      {pending ? '儲存中…' : isEdit ? '儲存變更' : '建立課程'}
    </button>
  );
}

function DeleteButton({id, locale}: {id: string; locale: string}) {
  return (
    <form
      action={deleteCourseAction}
      onSubmit={(e) => {
        if (!confirm('確定要刪除這個課程嗎？')) e.preventDefault();
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
