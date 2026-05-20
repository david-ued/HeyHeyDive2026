import Link from 'next/link';
import {notFound} from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  Users
} from 'lucide-react';
import {getTripBySlug, listBookingsForTrip} from '@/lib/cms/queries';
import type {Booking, BookingStatus} from '@/lib/cms/types';
import {BookingsTabs} from '../../_components/bookings-tabs';
import {QuickStatusSelect} from '../../_components/quick-status-select';
import {MaskedReveal} from '../../_components/masked-reveal';

export const dynamic = 'force-dynamic';

const DESTINATION_LABEL: Record<string, string> = {
  ludao: '綠島',
  lanyu: '蘭嶼',
  liuqiu: '小琉球',
  kenting: '墾丁',
  other: '其他'
};
const KIND_LABEL: Record<string, string> = {
  padi: 'PADI',
  aida: 'AIDA',
  experience: '體驗',
  other: '其他'
};
const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: '待聯絡',
  contacted: '已聯絡',
  confirmed: '已確認',
  cancelled: '取消'
};
const STATUS_DOT: Record<BookingStatus, string> = {
  pending: 'bg-amber-500',
  contacted: 'bg-sky-500',
  confirmed: 'bg-emerald-500',
  cancelled: 'bg-gray-400'
};

function diffDays(startISO: string, endISO: string): number {
  const a = new Date(startISO + 'T00:00:00Z').getTime();
  const b = new Date(endISO + 'T00:00:00Z').getTime();
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1);
}

function todayUtcIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function lineLink(rawId: string): string {
  return `https://line.me/ti/p/~${encodeURIComponent(rawId.replace(/^@/, ''))}`;
}

export default async function AdminTripBookingsPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) notFound();
  const bookingsResult = await listBookingsForTrip(slug);
  const bookings = bookingsResult.status === 'ok' ? bookingsResult.rows : [];

  const days = diffDays(trip.start_date, trip.end_date);
  const occupied = trip.capacity - trip.available_seats;
  const occupancyPct =
    trip.capacity > 0 ? Math.min(100, Math.round((occupied / trip.capacity) * 100)) : 0;
  const today = todayUtcIso();
  const daysToStart = Math.round(
    (new Date(trip.start_date + 'T00:00:00Z').getTime() - new Date(today + 'T00:00:00Z').getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const counts: Record<BookingStatus, number> = {
    pending: 0,
    contacted: 0,
    confirmed: 0,
    cancelled: 0
  };
  let totalParty = 0;
  for (const b of bookings) {
    counts[b.status] += 1;
    if (b.status !== 'cancelled') totalParty += b.party_size;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold text-navy-900">報名管理</h1>
        <p className="text-sm text-gray-500">
          以行程為單位檢視報名，掌握每場活動的名額進度與報名者狀態。
        </p>
      </header>

      <BookingsTabs active="by-trip" locale={locale} />

      <Link
        href={`/${locale}/admin/bookings/by-trip`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900"
      >
        <ChevronLeft className="h-4 w-4" /> 回到行程列表
      </Link>

      {/* Trip summary */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 font-en text-[11px] font-semibold tracking-[0.18em] text-coral uppercase">
            <span>{DESTINATION_LABEL[trip.destination] ?? trip.destination}</span>
            <span className="text-gray-300">·</span>
            <span>
              {days}D{Math.max(0, days - 1)}N
            </span>
            <span className="text-gray-300">·</span>
            <span>{KIND_LABEL[trip.kind] ?? trip.kind}</span>
          </div>
          <h2 className="font-heading text-xl font-bold text-navy-900">{trip.title}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-en text-xs text-gray-500">
            <span>
              {trip.start_date} → {trip.end_date}
            </span>
            <Link
              href={`/${locale}/admin/trips/${trip.id}`}
              className="text-coral hover:underline"
            >
              編輯行程 →
            </Link>
            <Link
              href={`/${locale}/trips/${trip.slug}`}
              className="text-coral hover:underline"
            >
              開啟前台頁面 →
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <p className="text-xs text-gray-500">名額</p>
              <p className="font-en text-lg font-semibold text-navy-900">
                {occupied}/{trip.capacity}
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full ${
                  occupancyPct >= 100
                    ? 'bg-coral'
                    : occupancyPct >= 70
                      ? 'bg-amber-400'
                      : 'bg-aqua'
                }`}
                style={{width: `${occupancyPct}%`}}
              />
            </div>
            <p className="font-en text-[11px] text-gray-400">
              已報名人數（含同行者）：{totalParty} 人 · 名額進度 {occupancyPct}%
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-500">距離出發</p>
            <p className="font-en text-2xl font-bold text-navy-900">
              {daysToStart < 0
                ? `已結束 ${Math.abs(daysToStart)} 天`
                : daysToStart === 0
                  ? '今天'
                  : `${daysToStart} 天`}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">報名狀態</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {(Object.keys(STATUS_LABEL) as BookingStatus[]).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s]}`} />
                  <span className="text-gray-600">{STATUS_LABEL[s]}</span>
                  <span className="font-en font-semibold text-navy-900">
                    {counts[s]}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bookings list */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h3 className="font-heading text-sm font-semibold text-navy-900">
            報名者（{bookings.length}）
          </h3>
        </header>

        {bookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">這個行程還沒有人報名</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <BookingRow key={b.id} booking={b} locale={locale} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function BookingRow({booking: b, locale}: {booking: Booking; locale: string}) {
  const companions = (b.companions ?? []).filter(Boolean);
  return (
    <li>
      <details className="group">
        <summary className="grid cursor-pointer list-none grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3 hover:bg-gray-50 md:grid-cols-[120px_1fr_140px_140px_120px_auto]">
          <span className="md:col-start-1">
            <QuickStatusSelect id={b.id} value={b.status} locale={locale} />
          </span>
          <div className="min-w-0 md:col-start-2">
            <div className="truncate font-medium text-navy-900">{b.contact_name}</div>
            <div className="font-en text-[11px] text-gray-500">
              {formatDateTime(b.created_at)}
            </div>
          </div>
          <div className="hidden font-en text-xs text-gray-600 md:col-start-3 md:block">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" /> {b.party_size}
            </span>
          </div>
          <div className="hidden font-en text-xs text-gray-600 md:col-start-4 md:block">
            {b.dive_cert_level ? (
              <span className="rounded bg-gray-50 px-1.5 py-0.5">
                {b.dive_cert_level}
              </span>
            ) : (
              <span className="text-gray-300">—</span>
            )}
          </div>
          <div className="hidden font-en text-xs text-gray-600 md:col-start-5 md:block">
            {b.contact_phone ? (
              <a
                href={`tel:${b.contact_phone}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 hover:text-coral"
              >
                <Phone className="h-3 w-3" /> {b.contact_phone}
              </a>
            ) : (
              <span className="text-gray-300">—</span>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 transition group-open:rotate-90" />
        </summary>

        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Block label="聯絡方式">
              <div className="flex flex-col gap-1.5 text-sm text-gray-700">
                <a
                  href={`mailto:${b.contact_email}`}
                  className="inline-flex items-center gap-1.5 text-coral hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" /> {b.contact_email}
                </a>
                {b.contact_phone ? (
                  <a
                    href={`tel:${b.contact_phone}`}
                    className="inline-flex items-center gap-1.5 text-coral hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" /> {b.contact_phone}
                  </a>
                ) : null}
                {b.contact_line ? (
                  <a
                    href={lineLink(b.contact_line)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-coral hover:underline"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> {b.contact_line}
                  </a>
                ) : null}
              </div>
            </Block>

            <Block label="緊急聯絡人">
              {b.emergency_contact_name || b.emergency_contact_phone ? (
                <div className="flex flex-col gap-0.5 text-sm text-gray-700">
                  <span>{b.emergency_contact_name ?? '—'}</span>
                  {b.emergency_contact_phone ? (
                    <a
                      href={`tel:${b.emergency_contact_phone}`}
                      className="font-en text-xs text-coral hover:underline"
                    >
                      {b.emergency_contact_phone}
                    </a>
                  ) : null}
                </div>
              ) : (
                <span className="text-sm text-gray-400">未填寫</span>
              )}
            </Block>

            <Block label="身分證 / 護照">
              {b.national_id ? (
                <MaskedReveal value={b.national_id} />
              ) : (
                <span className="text-sm text-gray-400">未填寫</span>
              )}
            </Block>

            <Block label="潛水證照">
              <div className="text-sm text-gray-700">
                {b.dive_cert_level ?? '—'}
                {b.dive_cert_number ? (
                  <span className="ml-1 font-en text-xs text-gray-500">
                    · {b.dive_cert_number}
                  </span>
                ) : null}
              </div>
            </Block>

            <Block label={`同行者（${companions.length}）`}>
              {companions.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {companions.map((c, i) => (
                    <li
                      key={i}
                      className="rounded-full bg-white px-2.5 py-0.5 text-xs text-gray-700 ring-1 ring-gray-200"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </Block>

            <Block label="使用者備註">
              <p className="whitespace-pre-line text-sm text-gray-700">
                {b.notes?.trim() || <span className="text-gray-400">—</span>}
              </p>
            </Block>

            <div className="md:col-span-2 lg:col-span-3">
              <Block label="內部備註">
                <p className="whitespace-pre-line text-sm text-gray-700">
                  {b.admin_note?.trim() || <span className="text-gray-400">尚未填寫</span>}
                </p>
                <Link
                  href={`/${locale}/admin/bookings/${b.id}`}
                  className="mt-2 inline-flex text-xs font-medium text-coral hover:underline"
                >
                  打開完整詳情頁編輯 →
                </Link>
              </Block>
            </div>
          </div>
        </div>
      </details>
    </li>
  );
}

function Block({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] uppercase tracking-wider text-gray-500">{label}</p>
      <div>{children}</div>
    </div>
  );
}
