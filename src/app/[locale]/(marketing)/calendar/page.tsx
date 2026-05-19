import {getTranslations} from 'next-intl/server';
import {ArrowRight, MapPin} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {
  CalendarSection,
  type CalendarEvent,
  type CalendarMonth
} from '@/components/marketing/sections/calendar-section';
import {LineIcon} from '@/components/marketing/brand-icons';
import {listTripsInRange} from '@/lib/cms/queries';
import type {Trip} from '@/lib/cms/types';

export const dynamic = 'force-dynamic';

const HARDCODED_TRIPS: Array<{site: string; slug: string; accent: string}> = [
  {slug: 'ludao-4d3n', site: 'ludao', accent: 'bg-navy-800'},
  {slug: 'liuqiu-2d1n', site: 'liuqiu', accent: 'bg-navy-700'},
  {slug: 'lanyu-5d4n', site: 'lanyu', accent: 'bg-navy-900'}
];

const ZH_MONTH = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const EN_MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function monthInfo(locale: string, date: Date): CalendarMonth {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const lastDay = new Date(Date.UTC(year, month, 0));
  const leadingBlanks = firstDay.getUTCDay();
  const daysInMonth = lastDay.getUTCDate();
  const monthLabel = locale === 'zh-TW' ? `${ZH_MONTH[month - 1]}月` : EN_MONTH[month - 1];
  const monthLabelEn = `${EN_MONTH[month - 1]} ${year}`;
  return {month, year, leadingBlanks, daysInMonth, monthLabel, monthLabelEn};
}

function mapTripToEvent(t: Trip, year: number, month: number): CalendarEvent {
  const start = new Date(t.start_date + 'T00:00:00Z');
  const end = new Date(t.end_date + 'T00:00:00Z');
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0));
  const clippedStart = start < monthStart ? monthStart : start;
  const clippedEnd = end > monthEnd ? monthEnd : end;
  return {
    id: t.id,
    range: [clippedStart.getUTCDate(), clippedEnd.getUTCDate()],
    kind: t.kind,
    destination: t.destination,
    label: t.title,
    href: `/trips/${t.slug}`
  };
}

export default async function CalendarPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations('Calendar');
  const now = new Date();
  const month = monthInfo(locale, now);
  const monthStartISO = `${month.year}-${String(month.month).padStart(2, '0')}-01`;
  const monthEndISO = `${month.year}-${String(month.month).padStart(2, '0')}-${String(month.daysInMonth).padStart(2, '0')}`;

  const result = await listTripsInRange(monthStartISO, monthEndISO);
  const events: CalendarEvent[] =
    result.status === 'ok'
      ? result.rows.map((tr) => mapTripToEvent(tr, month.year, month.month))
      : [];

  const upcomingRows = result.status === 'ok' ? result.rows.slice(0, 6) : [];

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
            TRIP CALENDAR
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-navy-900 md:text-[40px]">
            {t('title')}
          </h1>
          <p className="mt-3 text-base text-gray-500">{t('description')}</p>
        </div>
      </section>

      {result.status === 'missing-table' ? (
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

      <CalendarSection events={events} month={month} />

      {/* Upcoming Trips */}
      <section className="reveal bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-20 md:py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy-900 md:text-[28px]">
                {month.monthLabel}行程總覽
              </h2>
              <p className="mt-1 font-en text-xs font-semibold tracking-[0.2em] text-gray-400">
                {month.monthLabelEn} TRIPS
              </p>
            </div>
            <Link
              href="/calendar"
              className="font-en text-sm font-semibold text-coral hover:underline"
            >
              {t('upcoming.viewAll')} →
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {upcomingRows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
                這個月還沒有行程。
                <Link href="/admin/trips" className="ml-2 font-medium text-coral hover:underline">
                  到後台新增 →
                </Link>
              </div>
            ) : (
              upcomingRows.map((tr) => {
                const fallback = HARDCODED_TRIPS.find((h) => h.site === tr.destination);
                return (
                  <article
                    key={tr.id}
                    className="hover-lift flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white md:flex-row"
                  >
                    <div
                      className={`${fallback?.accent ?? 'bg-navy-800'} h-44 w-full shrink-0 md:h-auto md:w-[280px]`}
                      style={tr.cover_image ? {backgroundImage: `url(${tr.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center'} : undefined}
                    />
                    <div className="flex flex-1 items-center justify-between gap-6 p-6">
                      <div className="flex flex-col gap-2">
                        <p className="font-en text-[11px] font-bold tracking-[0.2em] text-coral uppercase">
                          {tr.destination}
                        </p>
                        <h3 className="font-heading text-xl font-bold text-navy-900">
                          {tr.title}
                        </h3>
                        <p className="font-en text-sm text-gray-500">
                          {tr.start_date} → {tr.end_date}
                        </p>
                        {tr.short_description ? (
                          <p className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5" /> {tr.short_description}
                          </p>
                        ) : null}
                      </div>
                      <div className="hidden flex-col items-end gap-2 md:flex">
                        <p className="font-en text-2xl font-bold text-navy-900">
                          NT$ {tr.price_twd.toLocaleString()}
                        </p>
                        <Link
                          href={`/trips/${tr.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 font-en text-sm font-semibold text-white hover:brightness-110"
                        >
                          {t('upcoming.book')} <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="reveal bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-20">
          <div className="grid grid-cols-2 divide-y divide-x divide-gray-200 rounded-lg border border-gray-200 bg-white md:grid-cols-4 md:divide-y-0">
            <Stat number={String(upcomingRows.length)} label={t('stats.month')} />
            <Stat number={String(new Set(upcomingRows.map((r) => r.destination)).size)} label={t('stats.destinations')} />
            <Stat number={String(upcomingRows.filter((r) => r.status === 'open').length)} highlight label={t('stats.available')} />
            <Stat number={String(upcomingRows.filter((r) => r.status === 'sold_out').length)} muted label={t('stats.soldOut')} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="reveal bg-navy-900 text-white">
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
