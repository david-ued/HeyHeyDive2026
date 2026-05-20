import Link from 'next/link';
import {ArrowRight, Inbox, Users} from 'lucide-react';
import {listTripsWithBookingSummary, type TripBookingSummary} from '@/lib/cms/queries';
import {MissingTableNotice} from '@/components/admin/form-fields';
import {BookingsTabs} from '../_components/bookings-tabs';
import type {BookingStatus} from '@/lib/cms/types';

export const dynamic = 'force-dynamic';

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

type Bucket = 'in_progress' | 'upcoming' | 'past' | 'draft';

const BUCKET_LABEL: Record<Bucket, string> = {
  upcoming: '即將出發',
  in_progress: '進行中',
  past: '已過去',
  draft: '草稿'
};

const BUCKET_ORDER: Bucket[] = ['in_progress', 'upcoming', 'past', 'draft'];

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

function bucketOf(t: TripBookingSummary['trip'], today: string): Bucket {
  if (t.status === 'draft') return 'draft';
  if (today < t.start_date) return 'upcoming';
  if (today > t.end_date) return 'past';
  return 'in_progress';
}

export default async function AdminBookingsByTripPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const result = await listTripsWithBookingSummary();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold text-navy-900">報名管理</h1>
        <p className="text-sm text-gray-500">
          以行程為單位檢視報名，掌握每場活動的名額進度與報名者狀態。
        </p>
      </header>

      <BookingsTabs active="by-trip" locale={locale} />

      {result.status === 'missing-table' ? (
        <MissingTableNotice />
      ) : result.status === 'error' ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {result.error}
        </p>
      ) : result.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">還沒有任何行程</p>
        </div>
      ) : (
        <BucketSections rows={result.rows} locale={locale} />
      )}
    </div>
  );
}

function BucketSections({rows, locale}: {rows: TripBookingSummary[]; locale: string}) {
  const today = todayUtcIso();
  const grouped: Record<Bucket, TripBookingSummary[]> = {
    in_progress: [],
    upcoming: [],
    past: [],
    draft: []
  };
  for (const row of rows) grouped[bucketOf(row.trip, today)].push(row);

  // Sort: upcoming + in_progress by nearest start_date asc; past by most recent end_date desc.
  grouped.in_progress.sort((a, b) => a.trip.start_date.localeCompare(b.trip.start_date));
  grouped.upcoming.sort((a, b) => a.trip.start_date.localeCompare(b.trip.start_date));
  grouped.past.sort((a, b) => b.trip.end_date.localeCompare(a.trip.end_date));
  grouped.draft.sort((a, b) => a.trip.title.localeCompare(b.trip.title));

  return (
    <div className="flex flex-col gap-8">
      {BUCKET_ORDER.map((bucket) => {
        const items = grouped[bucket];
        if (items.length === 0) return null;
        return (
          <section key={bucket} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3">
              <h2 className="font-heading text-base font-semibold text-navy-900">
                {BUCKET_LABEL[bucket]}
              </h2>
              <span className="font-en text-xs text-gray-400">({items.length})</span>
            </div>
            <ul className="flex flex-col gap-2">
              {items.map((row) => (
                <TripRow key={row.trip.id} row={row} bucket={bucket} locale={locale} today={today} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function TripRow({
  row,
  bucket,
  locale,
  today
}: {
  row: TripBookingSummary;
  bucket: Bucket;
  locale: string;
  today: string;
}) {
  const {trip, total, party, byStatus} = row;
  const days = diffDays(trip.start_date, trip.end_date);
  const occupancyPct = trip.capacity > 0
    ? Math.min(100, Math.round(((trip.capacity - trip.available_seats) / trip.capacity) * 100))
    : 0;
  const daysToStart = Math.round(
    (new Date(trip.start_date + 'T00:00:00Z').getTime() - new Date(today + 'T00:00:00Z').getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <li>
      <Link
        href={`/${locale}/admin/bookings/by-trip/${trip.slug}`}
        className="group flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-4 transition hover:border-coral md:flex-row md:items-center md:gap-6"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 font-en text-[11px] font-semibold tracking-[0.15em] text-coral uppercase">
            <span>{DESTINATION_LABEL[trip.destination] ?? trip.destination}</span>
            <span className="text-gray-300">·</span>
            <span>{days}D{Math.max(0, days - 1)}N</span>
            <span className="text-gray-300">·</span>
            <span>{KIND_LABEL[trip.kind] ?? trip.kind}</span>
          </div>
          <h3 className="font-heading text-base font-semibold text-navy-900 group-hover:text-coral">
            {trip.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-en text-xs text-gray-500">
            <span>
              {trip.start_date} → {trip.end_date}
            </span>
            {bucket === 'upcoming' ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                {daysToStart > 0 ? `還有 ${daysToStart} 天` : '今天'}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 md:w-[220px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">名額</span>
            <span className="font-en font-semibold text-navy-900">
              {trip.capacity - trip.available_seats}/{trip.capacity}
            </span>
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
        </div>

        <div className="flex shrink-0 items-center gap-3 md:w-[260px]">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {(Object.keys(STATUS_LABEL) as BookingStatus[]).map((s) => {
              const n = byStatus[s] ?? 0;
              if (n === 0) return null;
              return (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s]}`} />
                  {STATUS_LABEL[s]} {n}
                </span>
              );
            })}
            {total === 0 ? (
              <span className="text-xs text-gray-400">尚無報名</span>
            ) : null}
          </div>
          <div className="flex items-center gap-1 text-gray-400 group-hover:text-coral">
            <Users className="h-4 w-4" />
            <span className="font-en text-xs font-semibold">{party}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </div>
      </Link>
    </li>
  );
}
