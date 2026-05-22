'use client';

import {useState} from 'react';
import {Award, ExternalLink, X} from 'lucide-react';

const SYSTEM_LABEL: Record<string, {label: string; cls: string}> = {
  aida: {label: 'AIDA · 自由潛水', cls: 'bg-sky-100 text-sky-800 border-sky-200'},
  padi: {label: 'PADI · 水肺潛水', cls: 'bg-coral/15 text-coral border-coral/30'},
  other: {label: '其他系統', cls: 'bg-gray-100 text-gray-700 border-gray-200'}
};

export type DisplayCertificate = {
  id: string;
  system: string;
  level: string;
  cert_number: string | null;
  issued_date: string | null;
  notes: string | null;
  image_url: string | null;
};

export function CertificateGrid({items}: {items: DisplayCertificate[]}) {
  const [active, setActive] = useState<DisplayCertificate | null>(null);

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((c) => {
          const sys = SYSTEM_LABEL[c.system] ?? SYSTEM_LABEL.other;
          return (
            <li
              key={c.id}
              className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {c.image_url ? (
                <button
                  type="button"
                  onClick={() => setActive(c)}
                  className="group relative block aspect-[16/10] bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image_url}
                    alt={c.level}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  />
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                    <ExternalLink className="h-3 w-3" /> 放大檢視
                  </span>
                </button>
              ) : (
                <div className="matte flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-navy-900/70 to-coral/40 text-white">
                  <Award className="h-10 w-10 opacity-70" />
                </div>
              )}

              <div className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${sys.cls}`}
                  >
                    {sys.label}
                  </span>
                  {c.issued_date ? (
                    <span className="font-en text-[10px] text-gray-500">
                      {c.issued_date}
                    </span>
                  ) : null}
                </div>
                <h2 className="font-heading text-lg font-semibold text-navy-900">
                  {c.level}
                </h2>
                {c.cert_number ? (
                  <p className="font-en text-xs text-gray-600">
                    證照編號：{c.cert_number}
                  </p>
                ) : null}
                {c.notes ? (
                  <p className="whitespace-pre-line text-xs text-gray-600">
                    {c.notes}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {active?.image_url ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="關閉"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-navy-900 transition hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.image_url}
              alt={active.level}
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
            <div className="mt-2 text-center text-xs text-white/80">
              {active.level}
              {active.cert_number ? ` · ${active.cert_number}` : ''}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
