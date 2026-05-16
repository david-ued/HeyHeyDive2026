'use client';

import {useMemo, useState} from 'react';
import {ChevronLeft, ChevronRight, Calendar as CalIcon} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

type TripKind = 'aida' | 'padi' | 'experience' | 'other';
type Destination = 'ludao' | 'lanyu' | 'liuqiu' | 'kenting' | 'other' | 'mixed';

export type CalendarEvent = {
  id: string;
  range: [number, number]; // inclusive day-of-month range clipped to visible month
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

const KIND_STYLE: Record<TripKind, string> = {
  aida: 'bg-aqua/15 text-[#0d8b80] border border-aqua/40',
  padi: 'bg-coral/15 text-coral border border-coral/40',
  experience: 'bg-[#F5F3FF] text-[#6B4FBB] border border-[#C7B8F0]',
  other: 'bg-gray-100 text-gray-700 border border-gray-200'
};

const KIND_CELL_BG: Record<TripKind, string> = {
  aida: 'bg-[#F0FDFA]',
  padi: 'bg-[#FFF7ED]',
  experience: 'bg-[#F5F3FF]',
  other: 'bg-gray-50'
};

const KIND_DOT: Record<TripKind, string> = {
  aida: 'bg-aqua',
  padi: 'bg-coral',
  experience: 'bg-[#8A6FE0]',
  other: 'bg-gray-400'
};

type Filter = {
  destination: 'all' | 'liuqiu' | 'ludao' | 'lanyu';
  courseType: 'all' | 'aida' | 'padi' | 'experience';
};

function applyFilter(event: CalendarEvent, f: Filter): boolean {
  if (f.courseType !== 'all' && event.kind !== f.courseType) return false;
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
  month
}: {
  events: CalendarEvent[];
  month: CalendarMonth;
}) {
  const t = useTranslations('Calendar');
  const [filter, setFilter] = useState<Filter>({destination: 'all', courseType: 'all'});

  const cells: ({day: number; event?: CalendarEvent} | null)[] = useMemo(() => {
    const out: ({day: number; event?: CalendarEvent} | null)[] = [];
    for (let i = 0; i < month.leadingBlanks; i++) out.push(null);
    for (let d = 1; d <= month.daysInMonth; d++) {
      const event = events.find((e) => d >= e.range[0] && d <= e.range[1]);
      out.push({day: d, event});
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [events, month]);

  const matchedCount = events.filter((e) => applyFilter(e, filter)).length;

  return (
    <section className="bg-off-white text-ink">
      <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-20 md:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex w-fit overflow-hidden rounded-md border border-gray-200 text-sm">
            {(['all', 'liuqiu', 'ludao', 'lanyu'] as const).map((k, i) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter((f) => ({...f, destination: k}))}
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

        <div className="mt-4 flex flex-wrap gap-2">
          {(['all', 'aida', 'padi', 'experience'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter((f) => ({...f, courseType: k}))}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition',
                filter.courseType === k
                  ? 'border border-navy-900 bg-navy-900 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              {k !== 'all' ? (
                <span className={cn('h-2 w-2 rounded-full', KIND_DOT[k as TripKind])} />
              ) : null}
              {t(`course.${k}`)}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="prev"
                className="grid h-8 w-8 place-items-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="font-heading text-lg font-bold">
                {month.monthLabel}{' '}
                <span className="font-en text-sm font-medium tracking-wider text-gray-400">
                  {month.monthLabelEn}
                </span>
              </p>
              <button
                type="button"
                aria-label="next"
                className="grid h-8 w-8 place-items-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 font-en text-xs text-gray-600 hover:bg-gray-100"
            >
              <CalIcon className="h-3.5 w-3.5" /> {t('today')}
            </button>
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
                        className="h-[110px] border-r border-b border-gray-100 bg-gray-100/60"
                      />
                    );
                  }
                  const event = c.event && applyFilter(c.event, filter) ? c.event : undefined;
                  const cellBg = event ? KIND_CELL_BG[event.kind] : '';
                  if (event) {
                    return (
                      <Link
                        key={c.day}
                        href={event.href}
                        className={cn(
                          'group flex h-[110px] flex-col gap-2 border-r border-b border-gray-100 p-2.5 transition hover:ring-2 hover:ring-inset hover:ring-coral',
                          cellBg
                        )}
                      >
                        <div className="text-xs font-semibold text-gray-700">{c.day}</div>
                        <div
                          className={cn(
                            'truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                            KIND_STYLE[event.kind]
                          )}
                          title={event.label}
                        >
                          {event.label}
                        </div>
                      </Link>
                    );
                  }
                  return (
                    <div
                      key={c.day}
                      className={cn('h-[110px] border-r border-b border-gray-100 p-2.5', cellBg)}
                    >
                      <div className="text-xs font-semibold text-gray-700">{c.day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 px-6 py-4 text-xs">
            <div className="flex flex-wrap items-center gap-5 text-gray-600">
              <LegendDot color={KIND_DOT.padi} label={t('legend.padi')} />
              <LegendDot color={KIND_DOT.aida} label={t('legend.aida')} />
              <LegendDot color={KIND_DOT.experience} label={t('legend.experience')} />
            </div>
            <div className="hidden items-center gap-4 text-gray-500 md:flex">
              <span>{t('legend.todayHint')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LegendDot({color, label}: {color: string; label: string}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
      {label}
    </span>
  );
}
