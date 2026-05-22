import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {
  CalendarSection,
  type CalendarEvent,
  type CalendarMonth
} from '@/components/marketing/sections/calendar-section';
import {
  CalendarViewToggle,
  type CalendarView
} from '@/components/marketing/sections/calendar-view-toggle';
import {TripListView} from '@/components/marketing/sections/trip-list-view';
import {LineIcon} from '@/components/marketing/brand-icons';
import {listPublicTrips, listTripsInRange} from '@/lib/cms/queries';
import type {Trip} from '@/lib/cms/types';

export const dynamic = 'force-dynamic';

const ZH_MONTH = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const EN_MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function monthInfo(locale: string, year: number, month1to12: number): CalendarMonth {
  const firstDay = new Date(Date.UTC(year, month1to12 - 1, 1));
  const lastDay = new Date(Date.UTC(year, month1to12, 0));
  const leadingBlanks = firstDay.getUTCDay();
  const daysInMonth = lastDay.getUTCDate();
  const monthLabel =
    locale === 'zh-TW'
      ? `${ZH_MONTH[month1to12 - 1]}月`
      : locale === 'ja'
        ? `${month1to12}月`
        : EN_MONTH[month1to12 - 1];
  const monthLabelEn = `${EN_MONTH[month1to12 - 1]} ${year}`;
  return {month: month1to12, year, leadingBlanks, daysInMonth, monthLabel, monthLabelEn};
}

function diffDays(startISO: string, endISO: string): number {
  const a = new Date(startISO + 'T00:00:00Z').getTime();
  const b = new Date(endISO + 'T00:00:00Z').getTime();
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1);
}

function mapTripToEvent(t: Trip, year: number, month1to12: number): CalendarEvent {
  const start = new Date(t.start_date + 'T00:00:00Z');
  const end = new Date(t.end_date + 'T00:00:00Z');
  const monthStart = new Date(Date.UTC(year, month1to12 - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month1to12, 0));
  const clippedStart = start < monthStart ? monthStart : start;
  const clippedEnd = end > monthEnd ? monthEnd : end;
  const days = diffDays(t.start_date, t.end_date);
  return {
    id: t.id,
    range: [clippedStart.getUTCDate(), clippedEnd.getUTCDate()],
    days,
    nights: Math.max(0, days - 1),
    kind: t.kind,
    destination: t.destination,
    label: t.title,
    href: `/trips/${t.slug}`
  };
}

function parseYm(ym: string | undefined): {year: number; month: number} | null {
  if (!ym) return null;
  const m = /^(\d{4})-(\d{1,2})$/.exec(ym);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return {year, month};
}

function shiftYm(year: number, month: number, delta: number): string {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default async function CalendarPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{view?: string; ym?: string}>;
}) {
  const {locale} = await params;
  const {view: viewParam, ym: ymParam} = await searchParams;
  const t = await getTranslations('Calendar');

  const view: CalendarView = viewParam === 'calendar' ? 'calendar' : 'list';
  const now = new Date();
  const parsed = parseYm(ymParam);
  const year = parsed?.year ?? now.getUTCFullYear();
  const month = parsed?.month ?? now.getUTCMonth() + 1;
  const monthMeta = monthInfo(locale, year, month);
  const monthStartISO = `${year}-${String(month).padStart(2, '0')}-01`;
  const monthEndISO = `${year}-${String(month).padStart(2, '0')}-${String(monthMeta.daysInMonth).padStart(2, '0')}`;

  // For the calendar view: trips overlapping the visible month.
  // For the list view: every upcoming public trip across all months.
  const calendarResult = view === 'calendar' ? await listTripsInRange(monthStartISO, monthEndISO) : null;
  const listTrips = view === 'list' ? await listPublicTrips() : [];

  const todayIso = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    .toISOString()
    .slice(0, 10);
  const upcoming = listTrips
    .filter((tr) => tr.end_date >= todayIso)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const events: CalendarEvent[] =
    calendarResult?.status === 'ok'
      ? calendarResult.rows.map((tr) => mapTripToEvent(tr, year, month))
      : [];

  const missingTable = calendarResult?.status === 'missing-table';

  const prevYm = shiftYm(year, month, -1);
  const nextYm = shiftYm(year, month, 1);
  const todayYm = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const ymForToggle = parsed
    ? `${year}-${String(month).padStart(2, '0')}`
    : null;
  const todayDay =
    now.getUTCFullYear() === year && now.getUTCMonth() + 1 === month
      ? now.getUTCDate()
      : null;

  // Stats — currently visible month for calendar view, upcoming list for list view.
  const statRows =
    view === 'calendar'
      ? calendarResult?.status === 'ok'
        ? calendarResult.rows
        : []
      : upcoming;
  const destinations = new Set(statRows.map((r) => r.destination)).size;
  const openCount = statRows.filter((r) => r.status === 'open').length;
  const soldCount = statRows.filter((r) => r.status === 'sold_out').length;

  return (
    <>
      {/* Header */}
      <section className="animate-fade-up bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 pt-12 pb-2 md:px-20 md:pt-16">
          <nav className="flex items-center gap-2 font-en text-[13px] text-gray-400">
            <Link href="/" className="hover:text-coral">
              {t('breadcrumb.home')}
            </Link>
            <span>/</span>
            <span className="text-navy-900">{t('breadcrumb.calendar')}</span>
          </nav>
          <p className="mt-6 font-en text-xs font-bold tracking-[0.3em] text-gray-400">
            TRIP SIGN-UP
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-navy-900 md:text-[40px]">
            {t('title')}
          </h1>
          <p className="mt-3 text-base text-gray-500">{t('description')}</p>
        </div>
      </section>

      {missingTable ? (
        <section className="bg-off-white pb-12">
          <div className="mx-auto max-w-[900px] px-6 md:px-20">
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm text-amber-800">
              <p className="font-semibold">行程資料表尚未建立</p>
              <p className="mt-1">
                請先執行{' '}
                <code className="rounded bg-white px-1.5 py-0.5">pnpm db:migrate</code>
                ，或將{' '}
                <code className="rounded bg-white px-1.5 py-0.5">
                  supabase/migrations/0001_init_cms.sql
                </code>{' '}
                貼進 Supabase Dashboard 後按 Run，然後再到 /admin/trips 新增行程。
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Centred view toggle */}
      <section className="bg-off-white pt-2 pb-6">
        <CalendarViewToggle view={view} ym={ymForToggle} />
      </section>

      {view === 'calendar' ? (
        <CalendarSection
          events={events}
          month={monthMeta}
          prevYm={prevYm}
          nextYm={nextYm}
          todayYm={todayYm}
          todayDay={todayDay}
        />
      ) : (
        <TripListView trips={upcoming} />
      )}

      {/* Quick stats */}
      <section className="reveal bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-20">
          <div className="grid grid-cols-2 divide-y divide-x divide-gray-200 rounded-lg border border-gray-200 bg-white md:grid-cols-4 md:divide-y-0">
            <Stat number={String(statRows.length)} label={t('stats.month')} />
            <Stat number={String(destinations)} label={t('stats.destinations')} />
            <Stat number={String(openCount)} highlight label={t('stats.available')} />
            <Stat number={String(soldCount)} muted label={t('stats.soldOut')} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="matte reveal bg-navy-900 text-white">
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="font-heading text-2xl font-bold md:text-[28px]">
            {t('cta.title')}
          </h2>
          <p className="text-base text-gray-300">{t('cta.description')}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-coral px-6 py-3 font-en text-sm font-semibold text-white hover:brightness-110"
            >
              {t('cta.consult')}
            </Link>
            <a
              href="https://line.me/R/ti/p/@heydive"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-white px-6 py-3 font-en text-sm font-semibold tracking-wider text-white hover:bg-white/10"
            >
              <LineIcon className="h-4 w-4" /> {t('cta.line')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({
  number,
  label,
  highlight,
  muted
}: {
  number: string;
  label: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-6">
      <p
        className={`font-en text-4xl font-bold ${
          highlight ? 'text-coral' : muted ? 'text-gray-400' : 'text-navy-900'
        }`}
      >
        {number}
      </p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
