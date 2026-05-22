'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import Link from 'next/link';
import {upsertCourseAction, deleteCourseAction, type CourseFormState} from '../actions';
import type {Course} from '@/lib/cms/types';
import {
  FieldLabel,
  FormError,
  Select,
  Textarea,
  TextInput
} from '@/components/admin/form-fields';
import {CoverImageField} from '@/components/admin/cover-image-field';
import {BilingualField, ContentSection} from '@/components/admin/content-editor';

const initial: CourseFormState = {error: null};

const STEPS = [
  {key: 'theory', label: '理論課'},
  {key: 'pool', label: '泳池訓練'},
  {key: 'open', label: '開放水域'},
  {key: 'cert', label: '證照頒發'}
] as const;

const INCLUDES = ['l1', 'l2', 'l3', 'l4'] as const;
const EQUIPMENT = ['e1', 'e2', 'e3', 'e4'] as const;
const FAQ = ['q1', 'q2', 'q3', 'q4'] as const;

export function CourseForm({course, locale}: {course?: Course | null; locale: string}) {
  const [state, formAction] = useActionState(upsertCourseAction, initial);
  const isEdit = !!course;
  const zh = course?.content_zh ?? null;
  const en = course?.content_en ?? null;
  const ja = course?.content_ja ?? null;

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
        <FieldLabel label="タイトル (日本語)">
          <TextInput name="title_ja" defaultValue={course?.title_ja ?? ''} placeholder="AIDA 2 フリーダイバー" />
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
      <FieldLabel label="紹介 (日本語)">
        <Textarea name="description_ja" rows={4} defaultValue={course?.description_ja ?? ''} />
      </FieldLabel>

      <CoverImageField defaultUrl={course?.cover_image} />

      <ContentSection title="課程大綱" hint="四個固定階段：理論 / 泳池 / 開放水域 / 證照。">
        {STEPS.map((s) => (
          <div key={s.key} className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4">
            <p className="font-en text-xs font-semibold tracking-[0.15em] text-coral">{s.label}</p>
            <BilingualField path={`curriculum.steps.${s.key}.title`} label="小節標題" zh={zh} en={en} ja={ja} placeholderZh="Day 1 — 理論課程" placeholderEn="Day 1 — Theory" />
            <BilingualField path={`curriculum.steps.${s.key}.body`} label="內容說明" textarea rows={3} zh={zh} en={en} ja={ja} />
          </div>
        ))}
      </ContentSection>

      <ContentSection title="費用包含" hint="價格區塊「包含項目」的 4 個條列。">
        {INCLUDES.map((k, i) => (
          <BilingualField key={k} path={`price.includes.${k}`} label={`項目 ${i + 1}`} zh={zh} en={en} ja={ja} placeholderZh="教材費" placeholderEn="Course materials" />
        ))}
      </ContentSection>

      <ContentSection title="裝備" hint="4 個固定欄位，每個包含名稱與備註。">
        {EQUIPMENT.map((k, i) => (
          <div key={k} className="grid gap-3 md:grid-cols-[1fr_1fr] md:gap-3 rounded-md border border-gray-200 bg-white p-3">
            <BilingualField path={`equipment.${k}.name`} label={`裝備 ${i + 1} 名稱`} zh={zh} en={en} ja={ja} placeholderZh="蛙鏡" placeholderEn="Mask" />
            <BilingualField path={`equipment.${k}.note`} label="備註" zh={zh} en={en} ja={ja} placeholderZh="課程提供" placeholderEn="Provided" />
          </div>
        ))}
      </ContentSection>

      <ContentSection title="常見問題 FAQ" hint="4 組固定問答。">
        {FAQ.map((k, i) => (
          <div key={k} className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3">
            <BilingualField path={`faq.${k}.q`} label={`問題 ${i + 1}`} zh={zh} en={en} ja={ja} placeholderZh="課程包含什麼？" placeholderEn="What is included?" />
            <BilingualField path={`faq.${k}.a`} label="回答" textarea rows={2} zh={zh} en={en} ja={ja} />
          </div>
        ))}
      </ContentSection>

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
