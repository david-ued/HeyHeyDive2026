'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import Link from 'next/link';
import {upsertDiveSiteAction, deleteDiveSiteAction, type DiveSiteFormState} from '../actions';
import type {DiveSite} from '@/lib/cms/types';
import {
  FieldLabel,
  FormError,
  Select,
  Textarea,
  TextInput
} from '@/components/admin/form-fields';
import {CoverImageField} from '@/components/admin/cover-image-field';
import {BilingualField, ContentSection} from '@/components/admin/content-editor';

const initial: DiveSiteFormState = {error: null};

const NARRATIVES = ['narr1', 'narr2', 'narr3'] as const;
const SEA = ['s1', 's2', 's3', 's4'] as const;

export function DiveSiteForm({site, locale}: {site?: DiveSite | null; locale: string}) {
  const [state, formAction] = useActionState(upsertDiveSiteAction, initial);
  const isEdit = !!site;
  const zh = site?.content_zh ?? null;
  const en = site?.content_en ?? null;

  return (
    <form action={formAction} className="flex flex-col gap-6" encType="multipart/form-data">
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

      <CoverImageField defaultUrl={site?.cover_image} />

      <ContentSection
        title="故事段落"
        hint="景點詳情頁三個交錯段落。留白會 fallback 到既有翻譯文案。"
      >
        {NARRATIVES.map((k, i) => (
          <div key={k} className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4">
            <p className="font-en text-xs font-semibold tracking-[0.15em] text-coral">
              {`STORY ${i + 1}`}
            </p>
            <BilingualField path={`${k}.kicker`} label="小標 Kicker" zh={zh} en={en} placeholderZh="01 / GEOTHERMAL" placeholderEn="01 / GEOTHERMAL" />
            <BilingualField path={`${k}.title`} label="標題" zh={zh} en={en} placeholderZh="全世界僅三處的海底溫泉" placeholderEn="An undersea hot spring..." />
            <BilingualField path={`${k}.body`} label="內文" textarea rows={3} zh={zh} en={en} placeholderZh="朝日溫泉海域..." placeholderEn="Sulphurous water..." />
          </div>
        ))}
      </ContentSection>

      <ContentSection title="海洋生物" hint="共 4 格，每格包含主名稱與副名稱。">
        <BilingualField path="seaTitle" label="區塊標題" zh={zh} en={en} placeholderZh="綠島常見海洋生物" placeholderEn="Marine life at Ludao" />
        <div className="grid gap-3 md:grid-cols-2">
          {SEA.map((k, i) => (
            <div key={k} className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3">
              <p className="font-en text-[10px] font-semibold tracking-[0.15em] text-gray-500">{`SEA ${i + 1}`}</p>
              <BilingualField path={`sea.${k}.name`} label="主名稱" zh={zh} en={en} placeholderZh="綠蠵龜" placeholderEn="Green sea turtle" />
              <BilingualField path={`sea.${k}.en`} label="副標 / 別名" zh={zh} en={en} placeholderZh="Green Sea Turtle" placeholderEn="綠蠵龜" />
            </div>
          ))}
        </div>
      </ContentSection>

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
