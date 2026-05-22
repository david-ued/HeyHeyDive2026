'use client';

import {deleteCertificateAction} from '@/lib/cms/certificates';
import type {Certificate} from '@/lib/cms/types';

const SYSTEM_LABEL: Record<string, string> = {
  aida: 'AIDA',
  padi: 'PADI',
  other: '其他'
};

export function CertificateList({
  certificates,
  signedUrls,
  locale
}: {
  certificates: Certificate[];
  signedUrls: Record<string, string>;
  locale: string;
}) {
  if (certificates.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        尚未上傳任何證照。
      </p>
    );
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {certificates.map((c) => {
        const url = signedUrls[c.id];
        return (
          <li
            key={c.id}
            className="flex gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white p-3"
          >
            <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-gray-100">
              {url ? (
                <a href={url} target="_blank" rel="noreferrer noopener">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={c.level} className="h-full w-full object-cover" />
                </a>
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                  無圖
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between gap-2 overflow-hidden">
              <div className="flex flex-col gap-0.5">
                <span className="font-en text-[10px] font-medium uppercase tracking-wider text-coral">
                  {SYSTEM_LABEL[c.system] ?? c.system}
                  {c.issued_date ? ` · ${c.issued_date}` : ''}
                </span>
                <p className="truncate font-heading text-sm font-semibold text-navy-900">
                  {c.level}
                </p>
                {c.cert_number ? (
                  <p className="truncate font-en text-[11px] text-gray-500">
                    {c.cert_number}
                  </p>
                ) : null}
              </div>

              <form
                action={deleteCertificateAction}
                onSubmit={(e) => {
                  if (!confirm(`確定刪除「${c.level}」證照？`)) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="locale" value={locale} />
                <button
                  type="submit"
                  className="self-start rounded-md border border-red-200 px-2 py-0.5 text-[11px] text-red-600 hover:bg-red-50"
                >
                  刪除
                </button>
              </form>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
