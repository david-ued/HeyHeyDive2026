'use client';

import type {ReactNode} from 'react';
import {pickPath, type DeepContent} from '@/lib/cms/content';

const INPUT_CLS =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-en text-sm text-navy-900 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral';

/**
 * Two-input row: a ZH field and an EN field for the same logical path. Form names
 * are `cz.<path>` and `ce.<path>`; the server action collects both prefixes and
 * merges them into content_zh / content_en JSONB columns.
 */
export function BilingualField({
  path,
  label,
  hint,
  textarea,
  rows = 3,
  zh,
  en,
  placeholderZh,
  placeholderEn
}: {
  path: string;
  label: string;
  hint?: string;
  textarea?: boolean;
  rows?: number;
  zh: DeepContent;
  en: DeepContent;
  placeholderZh?: string;
  placeholderEn?: string;
}) {
  const defZh = pickPath(zh, path) ?? '';
  const defEn = pickPath(en, path) ?? '';

  const ZhInput = textarea ? (
    <textarea
      name={`cz.${path}`}
      defaultValue={defZh}
      rows={rows}
      placeholder={placeholderZh}
      className={INPUT_CLS}
    />
  ) : (
    <input
      name={`cz.${path}`}
      defaultValue={defZh}
      placeholder={placeholderZh}
      className={INPUT_CLS}
    />
  );

  const EnInput = textarea ? (
    <textarea
      name={`ce.${path}`}
      defaultValue={defEn}
      rows={rows}
      placeholder={placeholderEn}
      className={INPUT_CLS}
    />
  ) : (
    <input
      name={`ce.${path}`}
      defaultValue={defEn}
      placeholder={placeholderEn}
      className={INPUT_CLS}
    />
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-navy-900">{label}</span>
        {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">中文</span>
          {ZhInput}
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">English</span>
          {EnInput}
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
