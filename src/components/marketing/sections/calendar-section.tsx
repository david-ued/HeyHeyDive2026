'use client';

import {useState} from 'react';
import {ChevronLeft, ChevronRight, Calendar as CalIcon} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {cn} from '@/lib/utils';

type TripKind = 'aida' | 'padi' | 'experience';

type TripDot = {
  day: number;
  kind: TripKind;
  label: string;
};

const TRIPS: TripDot[] = [
  {day: 4, kind: 'padi', label: '綠島 4D3N'},
  {day: 5, kind: 'padi', label: '綠島 4D3N'},
  {day: 6, kind: 'padi', label: '綠島 4D3N'},
  {day: 7, kind: 'padi', label: '綠島 4D3N'},
  {day: 10, kind: 'aida', label: 'AIDA2'},
  {day: 11, kind: 'aida', label: 'AIDA2'},
  {day: 14, kind: 'experience', label: '體驗潛水'},
  {day: 18, kind: 'padi', label: '蘭嶼 5D4N'},
  {day: 19, kind: 'padi', label: '蘭嶼 5D4N'},
  {day: 20, kind: 'padi', label: '蘭嶼 5D4N'},
  {day: 21, kind: 'padi', label: '蘭嶼 5D4N'},
  {day: 22, kind: 'padi', label: '蘭嶼 5D4N'},
  {day: 25, kind: 'aida', label: 'AIDA3'},
  {day: 26, kind: 'aida', label: 'AIDA3'},
  {day: 27, kind: 'aida', label: 'AIDA3'}
];

const KIND_STYLE: Record<TripKind, string> = {
  aida: 'bg-aqua/15 text-aqua border border-aqua/30',
  padi: 'bg-coral/15 text-coral border border-coral/30',
  experience: 'bg-gold/20 text-gold-700 border border-gold/40'
};

const KIND_CELL_BG: Record<TripKind, string> = {
  aida: 'bg-[#F0FDFA]',
  padi: 'bg-[#FFF7ED]',
  experience: 'bg-[#F5F3FF]'
};

export function CalendarSection() {
  const t = useTranslations('Calendar');
  const [destination, setDestination] = useState<'all' | 'liuqiu' | 'ludao' | 'lanyu'>(
    'all'
  );
  const [courseType, setCourseType] = useState<'all' | 'aida' | 'padi' | 'experience'>(
    'all'
  );

  // Static July 2026 — Sun start. July 1, 2026 is a Wednesday.
  const month = t('month');
  const monthEn = t('monthEn');
  const leadingBlanks = 3; // Sun, Mon, Tue empty before Wed (Jul 1)
  const daysInMonth = 31;

  const cells: ({day: number; trip?: TripDot} | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const trip = TRIPS.find((x) => x.day === d);
    cells.push({day: d, trip});
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const filteredVisible = (trip?: TripDot) => {
    if (!trip) return undefined;
    if (courseType === 'all') return trip;
    return trip.kind === courseType ? trip : undefined;
  };

  return (
    <section className="bg-off-white text-ink">
      <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-30 md:py-16">
        {/* Filter row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex rounded-md border border-gray-200 overflow-hidden text-sm">
            {(['all', 'liuqiu', 'ludao', 'lanyu'] as const).map((k, i) => (
              <button
                key={k}
                type="button"
                onClick={() => setDestination(k)}
                className={cn(
                  'px-5 py-2.5 font-medium transition',
                  destination === k
                    ? 'bg-navy-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100',
                  i > 0 && 'border-l border-gray-200'
                )}
              >
                {t(`dest.${k}`)}
              </button>
            ))}
          </div>

          <div className="flex gap-3 text-sm">
            <FilterSelect label={t('typeAll')} />
            <FilterSelect label={t('seasonAll')} />
          </div>
        </div>

        {/* Course type pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(['all', 'aida', 'padi', 'experience'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setCourseType(k)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition',
                courseType === k
                  ? 'bg-navy-900 text-white border border-navy-900'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              )}
            >
              {t(`course.${k}`)}
            </button>
          ))}
        </div>

        {/* Calendar card */}
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
                {month}{' '}
                <span className="font-en text-sm font-medium tracking-wider text-gray-400">
                  {monthEn}
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
                    className="h-[110px] border-r border-b border-gray-100 bg-gray-100/60 last:border-r-0"
                  />
                );
              }
              const trip = filteredVisible(c.trip);
              return (
                <div
                  key={c.day}
                  className={cn(
                    'h-[110px] border-r border-b border-gray-100 p-2.5 last-in-row:border-r-0',
                    trip ? KIND_CELL_BG[trip.kind] : ''
                  )}
                >
                  <div className="text-xs font-semibold text-gray-700">{c.day}</div>
                  {trip ? (
                    <div
                      className={cn(
                        'mt-2 truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                        KIND_STYLE[trip.kind]
                      )}
                    >
                      {trip.label}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 px-6 py-4 text-xs">
            <div className="flex flex-wrap items-center gap-5 text-gray-600">
              <LegendDot color="bg-coral" label={t('legend.padi')} />
              <LegendDot color="bg-aqua" label={t('legend.aida')} />
              <LegendDot color="bg-gold" label={t('legend.experience')} />
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <span>{t('legend.todayHint')}</span>
              <span>·</span>
              <span>{t('legend.fullHint')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterSelect({label}: {label: string}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
    >
      {label}
      <ChevronRight className="h-4 w-4 rotate-90 text-gray-400" />
    </button>
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
