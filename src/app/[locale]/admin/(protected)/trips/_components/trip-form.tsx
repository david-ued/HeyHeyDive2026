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
import {CoverImageField} from '@/components/admin/cover-image-field';
import {BilingualField, ContentSection} from '@/components/admin/content-editor';

const initial: TripFormState = {error: null};

const DAYS = ['day1', 'day2', 'day3', 'day4'] as const;
const INCLUDED = [
  {key: 'lodging', label: '住宿'},
  {key: 'tanks', label: '氣瓶'},
  {key: 'meals', label: '餐食'},
  {key: 'guide', label: '教練 / 嚮導'},
  {key: 'insurance', label: '保險'},
  {key: 'scooter', label: '交通'}
] as const;
const NOT_INCLUDED = [
  {key: 'gear', label: '個人裝備'},
  {key: 'tips', label: '小費'},
  {key: 'travel', label: '旅平險'},
  {key: 'photo', label: '攝影'}
] as const;

export function TripForm({
  trip,
  locale
}: {
  trip?: Trip | null;
  locale: string;
}) {
  const [state, formAction] = useActionState(upsertTripAction, initial);
  const isEdit = !!trip;
  const zh = trip?.content_zh ?? null;
  const en = trip?.content_en ?? null;
  const ja = trip?.content_ja ?? null;

  return (
    <form action={formAction} className="flex flex-col gap-6" encType="multipart/form-data">
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
        <FieldLabel label="タイトル (日本語)" hint="可不填">
          <TextInput name="title_ja" defaultValue={trip?.title_ja ?? ''} placeholder="緑島 4日3泊 — 海底温泉ダイブ" />
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

      <FieldLabel label="詳細紹介 (日本語)">
        <Textarea name="description_ja" rows={4} defaultValue={trip?.description_ja ?? ''} />
      </FieldLabel>

      <CoverImageField defaultUrl={trip?.cover_image} />

      <ContentSection title="行程逐日" hint="最多 4 天。沒填的天數會 fallback 到既有翻譯文案。">
        {DAYS.map((d, i) => (
          <div key={d} className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4">
            <p className="font-en text-xs font-semibold tracking-[0.15em] text-coral">{`DAY ${i + 1}`}</p>
            <BilingualField path={`itinerary.${d}.title`} label="標題" zh={zh} en={en} ja={ja} placeholderZh="Day 1 — 抵達綠島" placeholderEn="Day 1 — Arrive at Ludao" />
            <BilingualField path={`itinerary.${d}.body`} label="行程內容" textarea rows={4} zh={zh} en={en} ja={ja} />
          </div>
        ))}
      </ContentSection>

      <ContentSection title="費用包含" hint="6 項固定欄位">
        <div className="grid gap-3 md:grid-cols-2">
          {INCLUDED.map((it) => (
            <div key={it.key} className="rounded-md border border-gray-200 bg-white p-3">
              <BilingualField path={`included.${it.key}`} label={it.label} zh={zh} en={en} ja={ja} placeholderZh="3 晚民宿住宿" placeholderEn="3 nights lodging" />
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="費用不含" hint="4 項固定欄位">
        <div className="grid gap-3 md:grid-cols-2">
          {NOT_INCLUDED.map((it) => (
            <div key={it.key} className="rounded-md border border-gray-200 bg-white p-3">
              <BilingualField path={`notIncluded.${it.key}`} label={it.label} zh={zh} en={en} ja={ja} placeholderZh="個人裝備租借" placeholderEn="Personal gear rental" />
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="教練介紹">
        <BilingualField path="instructor.name" label="姓名" zh={zh} en={en} ja={ja} placeholderZh="Karina · 卡琳娜" placeholderEn="Karina" />
        <BilingualField path="instructor.creds" label="資歷" zh={zh} en={en} ja={ja} placeholderZh="PADI Instructor · 10 年+" placeholderEn="PADI Instructor · 10+ yrs" />
        <BilingualField path="instructor.bio" label="簡介" textarea rows={3} zh={zh} en={en} ja={ja} />
      </ContentSection>

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
