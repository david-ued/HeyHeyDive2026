'use client';

import {useActionState, useState} from 'react';
import {useFormStatus} from 'react-dom';
import {Check, Send} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {createBookingAction, type BookingFormState} from '@/lib/cms/bookings';
import type {BookingItemType} from '@/lib/cms/types';

const initial: BookingFormState = {ok: false, error: null};

export function BookingForm({
  itemType,
  itemId,
  itemSlug,
  itemTitle
}: {
  itemType: BookingItemType;
  itemId: string;
  itemSlug: string;
  itemTitle: string;
}) {
  const t = useTranslations('Booking');
  const [state, formAction] = useActionState(createBookingAction, initial);
  const [open, setOpen] = useState(false);

  if (state.ok) {
    return (
      <section className="bg-off-white py-16 text-ink">
        <div className="mx-auto max-w-xl px-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-heading text-2xl font-bold">
            {t('successTitle')}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {t('successBody')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-off-white py-16 text-ink">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6">
        <header className="flex flex-col gap-2 text-center">
          <p className="font-en text-[12px] font-semibold tracking-[0.2em] text-coral">
            {t('kicker')}
          </p>
          <h3 className="font-heading text-3xl font-bold">{t('title')}</h3>
          <p className="text-sm text-gray-600">
            {t.rich('subtitle', {
              item: () => <span className="font-semibold">{itemTitle}</span>
            })}
          </p>
        </header>

        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mx-auto inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 font-en text-sm font-semibold text-white shadow-md transition hover:brightness-110"
          >
            <Send className="h-4 w-4" />
            {t('openButton')}
          </button>
        ) : (
          <form action={formAction} className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm">
            <input type="hidden" name="item_type" value={itemType} />
            <input type="hidden" name="item_id" value={itemId} />
            <input type="hidden" name="item_slug" value={itemSlug} />
            <input type="hidden" name="item_title" value={itemTitle} />

            <Field label={t('field.name')} required>
              <input
                type="text"
                name="contact_name"
                required
                maxLength={80}
                className={INPUT}
                autoComplete="name"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('field.email')} required>
                <input
                  type="email"
                  name="contact_email"
                  required
                  maxLength={120}
                  className={INPUT}
                  autoComplete="email"
                />
              </Field>
              <Field label={t('field.phone')}>
                <input
                  type="tel"
                  name="contact_phone"
                  maxLength={40}
                  className={INPUT}
                  autoComplete="tel"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('field.line')}>
                <input
                  type="text"
                  name="contact_line"
                  maxLength={60}
                  className={INPUT}
                  placeholder="@..."
                />
              </Field>
              <Field label={t('field.partySize')}>
                <input
                  type="number"
                  name="party_size"
                  min={1}
                  max={20}
                  defaultValue={1}
                  className={INPUT}
                />
              </Field>
            </div>
            <Field label={t('field.notes')}>
              <textarea
                name="notes"
                rows={4}
                maxLength={1000}
                className={INPUT}
                placeholder={t('field.notesPlaceholder')}
              />
            </Field>

            {state.error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </p>
            ) : null}

            <p className="text-xs text-gray-500">{t('disclaimer')}</p>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {t('cancel')}
              </button>
              <SubmitButton label={t('submit')} pendingLabel={t('submitting')} />
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

const INPUT =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral';

function Field({label, required, children}: {label: string; required?: boolean; children: React.ReactNode}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-navy-900">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function SubmitButton({label, pendingLabel}: {label: string; pendingLabel: string}) {
  const {pending} = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-2.5 font-en text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
    >
      <Send className="h-4 w-4" />
      {pending ? pendingLabel : label}
    </button>
  );
}
