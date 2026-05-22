'use client';

import type {ReactNode} from 'react';
import {pickPath, type DeepContent} from '@/lib/cms/content';

const INPUT_CLS =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-en text-sm text-navy-900 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral';

/**
 * Three-input row: ZH, EN, JA fields for the same logical path. Form names are
 * `cz.<path>`, `ce.<path>`, `cj.<path>`; the server action collects each prefix
 * and merges them into content_zh / content_en / content_ja JSONB columns.
 */
export function BilingualField({
  path,
  label,
  hint,
  textarea,
  rows = 3,
  zh,
  en,
  ja,
  placeholderZh,
  placeholderEn,
  placeholderJa
}: {
  path: string;
  label: string;
  hint?: string;
  textarea?: boolean;
  rows?: number;
  zh: DeepContent;
  en: DeepContent;
  ja?: DeepContent;
  placeholderZh?: string;
  placeholderEn?: string;
  placeholderJa?: string;
}) {
  const defZh = pickPath(zh, path) ?? '';
  const defEn = pickPath(en, path) ?? '';
  const defJa = pickPath(ja ?? null, path) ?? '';

  const renderInput = (
    name: string,
    defaultValue: string,
    placeholder: string | undefined
  ) =>
    textarea ? (
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className={INPUT_CLS}
      />
    ) : (
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={INPUT_CLS}
      />
    );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-navy-900">{label}</span>
        {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">中文</span>
          {renderInput(`cz.${path}`, defZh, placeholderZh)}
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">English</span>
          {renderInput(`ce.${path}`, defEn, placeholderEn)}
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">日本語</span>
          {renderInput(`cj.${path}`, defJa, placeholderJa)}
        </div>
      </div>
    </div>
  );
}

export function ContentSection({
  title,
  hint,
  children
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-5">
      <header>
        <h3 className="font-heading text-base font-semibold text-navy-900">
          {title}
        </h3>
        {hint ? <p className="mt-0.5 text-xs text-gray-500">{hint}</p> : null}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
