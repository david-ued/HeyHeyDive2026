'use client';

import {useMemo, useState} from 'react';
import {ChevronLeft, ChevronRight, Calendar as CalIcon} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

type TripKind = 'aida' | 'padi' | 'experience' | 'other';
type Destination = 'ludao' | 'lanyu' | 'liuqiu' | 'kenting' | 'other' | 'mixed';

export type CalendarEvent = {
  id: string;
  /** inclusive day-of-month range clipped to visible month */
  range: [number, number];
  /** full duration in days regardless of clipping */
  days: number;
  /** full duration in nights regardless of clipping */
  nights: number;
  kind: TripKind;
  destination: Destination;
  label: string;
  href: string;
};

export type CalendarMonth = {
  /** 1–12 */
  month: number;
  year: number;
  /** Day of week (0=Sun..6=Sat) of the 1st */
  leadingBlanks: number;
  daysInMonth: number;
  monthLabel: string;
  monthLabelEn: string;
};

const KIND_CHIP: Record<TripKind, string> = {
  aida: 'bg-aqua/20 text-[#0d8b80] border-aqua/50',
  padi: 'bg-coral/15 text-coral border-coral/40',
  experience: 'bg-[#F0EAFF] text-[#6B4FBB] border-[#C7B8F0]',
  other: 'bg-gray-100 text-gray-700 border-gray-200'
};

const DEST_SHORT: Record<Destination, {zh: string; en: string}> = {
  ludao: {zh: '綠島', en: 'Ludao'},
  lanyu: {zh: '蘭嶼', en: 'Lanyu'},
  liuqiu: {zh: '小琉球', en: 'Liuqiu'},
  kenting: {zh: '墾丁', en: 'Kenting'},
  other: {zh: '其他', en: 'Other'},
  mixed: {zh: '多地', en: 'Mixed'}
};

const MAX_VISIBLE = 3;

type Filter = {
  destination: 'all' | 'liuqiu' | 'ludao' | 'lanyu';
};

function applyFilter(event: CalendarEvent, f: Filter): boolean {
  if (
    f.destination !== 'all' &&
    event.destination !== 'mixed' &&
    event.destination !== f.destination
  )
    return false;
  return true;
}

export function CalendarSection({
  events,
  month,
  prevYm,
  nextYm,
  todayYm,
  todayDay
}: {
  events: CalendarEvent[];
  month: CalendarMonth;
  prevYm: string;
  nextYm: string;
  todayYm: string;
  /** day-of-month of "today" if today is within the visible month; else null */
  todayDay: number | null;
}) {
  const t = useTranslations('Calendar');
  const locale = useLocale();
  const langKey: 'zh' | 'en' = locale === 'zh-TW' ? 'zh' : 'en';
  const [filter, setFilter] = useState<Filter>({destination: 'all'});

  const cells: ({day: number; events: CalendarEvent[]} | null)[] = useMemo(() => {
    const out: ({day: number; events: CalendarEvent[]} | null)[] = [];
    for (let i = 0; i < month.leadingBlanks; i++) out.push(null);
    for (let d = 1; d <= month.daysInMonth; d++) {
      const matching = events.filter((e) => d >= e.range[0] && d <= e.range[1]);
      out.push({day: d, events: matching});
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [events, month]);

  const visibleEvents = events.filter((e) => applyFilter(e, filter));
  const matchedCount = visibleEvents.length;

  return (
    <section className="bg-off-white text-ink">
      <div className="mx-auto max-w-[1440px] px-6 pb-12 md:px-20 md:pb-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex w-fit overflow-hidden rounded-md border border-gray-200 text-sm">
            {(['all', 'liuqiu', 'ludao', 'lanyu'] as const).map((k, i) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter({destination: k})}
                className={cn(
                  'px-4 py-2 font-medium transition md:px-5 md:py-2.5',
                  filter.destination === k
                    ? 'bg-navy-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100',
                  i > 0 && 'border-l border-gray-200'
                )}
              >
                {t(`dest.${k}`)}
              </button>
            ))}
          </div>
          <p className="font-en text-xs text-gray-500">
            {t('matchCount', {count: matchedCount})}
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <Link
                href={`/calendar?view=calendar&ym=${prevYm}`}
                aria-label={t('prevMonth')}
                className="grid h-8 w-8 place-items-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <p className="font-heading text-lg font-bold">
                {month.monthLabel}{' '}
                <span className="font-en text-sm font-medium tracking-wider text-gray-400">
                  {month.monthLabelEn}
                </span>
              </p>
              <Link
                href={`/calendar?view=calendar&ym=${nextYm}`}
                aria-label={t('nextMonth')}
                className="grid h-8 w-8 place-items-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <Link
              href={`/calendar?view=calendar&ym=${todayYm}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 font-en text-xs text-gray-600 hover:bg-gray-100"
            >
              <CalIcon className="h-3.5 w-3.5" /> {t('today')}
            </Link>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                  <div
                    key={d}
                    className="py-2.5 text-center font-en text-[11px] font-semibold tracking-wider text-gray-500"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {cells.map((c, i) => {
                  if (!c) {
                    return (
                      <div
                        key={`b-${i}`}
                        className="min-h-[110px] border-r border-b border-gray-100 bg-gray-100/60"
                      />
                    );
                  }
                  const isToday = todayDay !== null && c.day === todayDay;
                  const dayEvents = c.events.filter((e) => applyFilter(e, filter));
                  const visible = dayEvents.slice(0, MAX_VISIBLE);
                  const overflow = dayEvents.length - visible.length;

                  return (
                    <div
                      key={c.day}
                      className={cn(
                        'relative flex min-h-[110px] flex-col gap-1 border-r border-b border-gray-100 p-1.5',
                        isToday && 'bg-coral/[0.04] ring-2 ring-coral ring-inset'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-semibold',
                            isToday
                              ? 'bg-coral text-white'
                              : 'text-gray-700'
                          )}
                        >
                          {c.day}
                        </span>
                      </div>
                      <div className="flex flex-col gap-[3px]">
                        {visible.map((event) => {
                          const isFirst = c.day === event.range[0];
                          const destShort = DEST_SHORT[event.destination][langKey];
                          const duration =
                            locale === 'zh-TW'
                              ? `${event.days}天${event.nights}夜`
                              : `${event.days}D${event.nights}N`;
                          return (
                            <Link
                              key={event.id}
                              href={event.href}
                              title={event.label}
                              className={cn(
                                'flex items-center gap-1 truncate rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-tight transition hover:brightness-95',
                                KIND_CHIP[event.kind],
                                !isFirst && 'opacity-60'
                              )}
                            >
                              <span className="truncate">{destShort}</span>
                              {isFirst ? (
                                <span className="ml-auto shrink-0 text-[9px] font-normal opacity-80">
                                  {duration}
                                </span>
                              ) : (
                                <span className="ml-auto shrink-0 text-[9px] font-normal opacity-60">
                                  →
                                </span>
                              )}
                            </Link>
                          );
                        })}
                        {overflow > 0 ? (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                            +{overflow}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
