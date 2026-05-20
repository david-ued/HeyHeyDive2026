import {notFound} from 'next/navigation';
import Link from 'next/link';
import {ChevronLeft} from 'lucide-react';
import {getBooking} from '@/lib/cms/queries';
import {BookingStatusForm} from './_components/booking-status-form';
import {MaskedReveal} from '../_components/masked-reveal';

export const dynamic = 'force-dynamic';

const ITEM_TYPE_LABEL: Record<string, string> = {trip: '行程', course: '課程'};

export default async function AdminBookingDetail({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  const booking = await getBooking(id);
  if (!booking) notFound();

  const itemHref =
    booking.item_type === 'trip'
      ? `/${locale}/trips/${booking.item_slug}`
      : `/${locale}/courses/${booking.item_slug}`;

  const companions = (booking.companions ?? []).filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={
          booking.item_type === 'trip'
            ? `/${locale}/admin/bookings/by-trip/${booking.item_slug}`
            : `/${locale}/admin/bookings`
        }
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900"
      >
        <ChevronLeft className="h-4 w-4" /> 回到報名列表
      </Link>

      <header className="flex flex-col gap-1">
        <p className="font-en text-xs font-semibold tracking-[0.2em] text-coral">
          BOOKING #{booking.id.slice(0, 8)}
        </p>
        <h1 className="font-heading text-2xl font-bold text-navy-900">
          {booking.contact_name} 的報名
        </h1>
        <p className="text-sm text-gray-500">
          送出時間：{new Date(booking.created_at).toLocaleString('zh-TW')}
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 font-heading text-lg font-semibold text-navy-900">聯絡人資訊</h2>
          <dl className="grid gap-y-3 gap-x-6 sm:grid-cols-2">
            <Field label="姓名">{booking.contact_name}</Field>
            <Field label="Email">
              <a className="text-coral hover:underline" href={`mailto:${booking.contact_email}`}>
                {booking.contact_email}
              </a>
            </Field>
            <Field label="電話">
              {booking.contact_phone ? (
                <a className="text-coral hover:underline" href={`tel:${booking.contact_phone}`}>
                  {booking.contact_phone}
                </a>
              ) : (
                '—'
              )}
            </Field>
            <Field label="LINE ID">{booking.contact_line ?? '—'}</Field>
            <Field label="報名人數">{booking.party_size}</Field>
            <Field label="身分證 / 護照">
              {booking.national_id ? (
                <MaskedReveal value={booking.national_id} />
              ) : (
                '—'
              )}
            </Field>
          </dl>

          <h2 className="mb-3 mt-8 font-heading text-lg font-semibold text-navy-900">緊急聯絡人</h2>
          <dl className="grid gap-y-3 gap-x-6 sm:grid-cols-2">
            <Field label="姓名">{booking.emergency_contact_name ?? '—'}</Field>
            <Field label="電話">
              {booking.emergency_contact_phone ? (
                <a
                  className="text-coral hover:underline"
                  href={`tel:${booking.emergency_contact_phone}`}
                >
                  {booking.emergency_contact_phone}
                </a>
              ) : (
                '—'
              )}
            </Field>
          </dl>

          <h2 className="mb-3 mt-8 font-heading text-lg font-semibold text-navy-900">潛水資歷</h2>
          <dl className="grid gap-y-3 gap-x-6 sm:grid-cols-2">
            <Field label="證照等級">{booking.dive_cert_level ?? '—'}</Field>
            <Field label="證照編號">{booking.dive_cert_number ?? '—'}</Field>
          </dl>

          <h2 className="mb-3 mt-8 font-heading text-lg font-semibold text-navy-900">
            同行者（{companions.length}）
          </h2>
          {companions.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {companions.map((c, i) => (
                <li
                  key={i}
                  className="rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-700 ring-1 ring-gray-200"
                >
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">（未填寫）</p>
          )}

          <h2 className="mb-3 mt-8 font-heading text-lg font-semibold text-navy-900">備註</h2>
          <p className="whitespace-pre-line rounded-md bg-gray-50 px-3 py-3 text-sm text-gray-700">
            {booking.notes?.trim() || '（無備註）'}
          </p>

          <h2 className="mb-3 mt-8 font-heading text-lg font-semibold text-navy-900">報名項目</h2>
          <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
            <span className="font-en text-xs text-gray-500">
              {ITEM_TYPE_LABEL[booking.item_type]} · {booking.item_slug}
            </span>
            <span className="text-navy-900">{booking.item_title_snapshot}</span>
            <Link href={itemHref} className="text-sm text-coral hover:underline">
              開啟對應頁面 →
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <BookingStatusForm
            id={booking.id}
            status={booking.status}
            adminNote={booking.admin_note}
            locale={locale}
          />
        </div>
      </section>
    </div>
  );
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="text-sm text-navy-900">{children}</dd>
    </div>
  );
}
