'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import {updateBookingStatusAction, type BookingUpdateState} from '@/lib/cms/bookings';
import type {BookingStatus} from '@/lib/cms/types';

const initial: BookingUpdateState = {error: null};

const STATUS_OPTIONS: Array<{value: BookingStatus; label: string; hint: string}> = [
  {value: 'pending', label: '尚未聯絡', hint: '剛送出，尚未跟使用者接觸'},
  {value: 'contacted', label: '已聯絡', hint: '已寄信 / LINE，等對方回覆'},
  {value: 'confirmed', label: '已確認', hint: '確定報名並付款'},
  {value: 'cancelled', label: '已取消', hint: '使用者放棄或不符合條件'}
];

export function BookingStatusForm({
  id,
  status,
  adminNote,
  locale
}: {
  id: string;
  status: BookingStatus;
  adminNote: string | null;
  locale: string;
}) {
  const [state, formAction] = useActionState(updateBookingStatusAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="locale" value={locale} />

      <div>
        <h2 className="mb-2 font-heading text-lg font-semibold text-navy-900">狀態</h2>
        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50">
              <input
                type="radio"
                name="status"
                value={opt.value}
                defaultChecked={status === opt.value}
                className="mt-1"
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium text-navy-900">{opt.label}</span>
                <span className="text-xs text-gray-500">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-navy-900" htmlFor="admin_note">
          內部備註
        </label>
        <textarea
          id="admin_note"
          name="admin_note"
          rows={4}
          defaultValue={adminNote ?? ''}
          placeholder="記錄聯絡內容、付款狀態等（僅後台可見）"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        />
      </div>

      {state.error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
    >
      {pending ? '儲存中…' : '更新狀態'}
    </button>
  );
}
