'use client';

import {useState, useTransition} from 'react';
import {quickUpdateBookingStatusAction} from '@/lib/cms/bookings';
import type {BookingStatus} from '@/lib/cms/types';

const OPTIONS: Array<{value: BookingStatus; label: string; cls: string}> = [
  {value: 'pending', label: '待聯絡', cls: 'bg-amber-50 text-amber-800 border-amber-200'},
  {value: 'contacted', label: '已聯絡', cls: 'bg-sky-50 text-sky-800 border-sky-200'},
  {value: 'confirmed', label: '已確認', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200'},
  {value: 'cancelled', label: '取消', cls: 'bg-gray-100 text-gray-600 border-gray-200'}
];

export function QuickStatusSelect({
  id,
  value,
  locale
}: {
  id: string;
  value: BookingStatus;
  locale: string;
}) {
  const [current, setCurrent] = useState<BookingStatus>(value);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [credential, setCredential] = useState<{email: string; password: string} | null>(null);
  const active = OPTIONS.find((o) => o.value === current) ?? OPTIONS[0];

  return (
    <div className="flex flex-col gap-1">
      <label className={`relative inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs font-medium ${active.cls} ${pending ? 'opacity-60' : ''}`}>
        <select
          value={current}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as BookingStatus;
            const prev = current;
            setCurrent(next);
            setError(null);
            setCredential(null);
            startTransition(async () => {
              const r = await quickUpdateBookingStatusAction(id, next, locale);
              if (r.error) {
                setError(r.error);
                setCurrent(prev);
              } else if (r.credential) {
                setCredential(r.credential);
              }
            });
          }}
          className="appearance-none bg-transparent pr-4 outline-none"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-1.5">▾</span>
      </label>
      {error ? <span className="text-[10px] text-red-600">{error}</span> : null}
      {credential ? (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-900">
          <p className="font-medium">新會員帳號：</p>
          <p className="font-en">{credential.email}</p>
          <p className="font-en">密碼：{credential.password}</p>
        </div>
      ) : null}
    </div>
  );
}
