'use client';

import {useActionState, useMemo, useState} from 'react';
import {useFormStatus} from 'react-dom';
import {Check, Send} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {createBookingAction, type BookingFormState} from '@/lib/cms/bookings';
import type {BookingItemType} from '@/lib/cms/types';

const initial: BookingFormState = {ok: false, error: null};

const MAX_PARTY = 12;

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
  const [partySize, setPartySize] = useState(1);

  const companionSlots = useMemo(
    () => Array.from({length: Math.max(0, partySize - 1)}, (_, i) => i + 2),
    [partySize]
  );

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

        <form
          action={formAction}
          id="booking-form"
          className="flex flex-col gap-6 rounded-lg bg-white p-6 shadow-sm"
        >
            <input type="hidden" name="item_type" value={itemType} />
            <input type="hidden" name="item_id" value={itemId} />
            <input type="hidden" name="item_slug" value={itemSlug} />
            <input type="hidden" name="item_title" value={itemTitle} />

            <Fieldset legend={t('sections.contact')}>
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
                    max={MAX_PARTY}
                    value={partySize}
                    onChange={(e) => {
                      const n = Number(e.target.value) || 1;
                      setPartySize(Math.max(1, Math.min(MAX_PARTY, n)));
                    }}
                    className={INPUT}
                  />
                </Field>
              </div>
            </Fieldset>

            <Fieldset legend={t('sections.dive')}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={t('field.certLevel')}
                  hint={t('field.certLevelHint')}
                >
                  <input
                    type="text"
                    name="dive_cert_level"
                    maxLength={60}
                    className={INPUT}
                    placeholder="OW / AOW / Free Diver L1 ..."
                  />
                </Field>
                <Field label={t('field.certNumber')}>
                  <input
                    type="text"
                    name="dive_cert_number"
                    maxLength={60}
                    className={INPUT}
                  />
                </Field>
              </div>
            </Fieldset>

            {companionSlots.length > 0 ? (
              <Fieldset
                legend={t('sections.companions')}
                hint={t('field.companionsHint')}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {companionSlots.map((n) => (
                    <Field key={n} label={t('field.companionN', {n})}>
                      <input
                        type="text"
                        name="companions"
                        maxLength={80}
                        className={INPUT}
                      />
                    </Field>
                  ))}
                </div>
              </Fieldset>
            ) : null}

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

            <p className="text-xs leading-relaxed text-gray-500">
              {t('disclaimer')}
            </p>

          <div className="flex items-center justify-end gap-3">
            <SubmitButton label={t('submit')} pendingLabel={t('submitting')} />
          </div>
        </form>
      </div>
    </section>
  );
}

const INPUT =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral';

function Fieldset({
  legend,
  hint,
  children
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-3 border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
      <legend className="font-heading text-sm font-semibold text-navy-900">
        {legend}
      </legend>
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

function Field({
  label,
  required,
  hint,
  children
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-navy-900">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
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
