import {useTranslations, useLocale} from 'next-intl';
import {ArrowRight, MapPin} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import type {Trip} from '@/lib/cms/types';
import {cn} from '@/lib/utils';

const DEST_ACCENT: Record<string, string> = {
  ludao: 'bg-navy-800',
  lanyu: 'bg-navy-900',
  liuqiu: 'bg-navy-700',
  kenting: 'bg-aqua/40',
  other: 'bg-gray-400',
  mixed: 'bg-gray-400'
};

const KIND_BADGE: Record<string, string> = {
  padi: 'bg-coral/15 text-coral border border-coral/30',
  aida: 'bg-aqua/15 text-[#0d8b80] border border-aqua/40',
  experience: 'bg-[#F5F3FF] text-[#6B4FBB] border border-[#C7B8F0]',
  other: 'bg-gray-100 text-gray-700 border border-gray-200'
};

const KIND_LABEL: Record<string, {zh: string; en: string; ja: string}> = {
  padi: {zh: 'PADI 水肺', en: 'PADI', ja: 'PADI スキューバ'},
  aida: {zh: 'AIDA 自由潛水', en: 'AIDA', ja: 'AIDA フリーダイビング'},
  experience: {zh: '體驗潛水', en: 'Try-dive', ja: '体験ダイブ'},
  other: {zh: '其他', en: 'Other', ja: 'その他'}
};

const DEST_LABEL: Record<string, {zh: string; en: string; ja: string}> = {
  ludao: {zh: '綠島', en: 'Ludao', ja: '緑島'},
  lanyu: {zh: '蘭嶼', en: 'Lanyu', ja: '蘭嶼'},
  liuqiu: {zh: '小琉球', en: 'Liuqiu', ja: '小琉球'},
  kenting: {zh: '墾丁', en: 'Kenting', ja: '墾丁'},
  other: {zh: '其他', en: 'Other', ja: 'その他'}
};

function diffDays(startISO: string, endISO: string): number {
  const a = new Date(startISO + 'T00:00:00Z').getTime();
  const b = new Date(endISO + 'T00:00:00Z').getTime();
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1);
}

function formatRange(startISO: string, endISO: string, locale: string): string {
  const s = new Date(startISO + 'T00:00:00Z');
  const e = new Date(endISO + 'T00:00:00Z');
  const sameYear = s.getUTCFullYear() === e.getUTCFullYear();
  const fmt = (d: Date, withYear: boolean) => {
    if (locale === 'zh-TW') {
      return `${withYear ? d.getUTCFullYear() + '/' : ''}${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
    }
    if (locale === 'ja') {
      return `${withYear ? d.getUTCFullYear() + '年' : ''}${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
    }
    return `${
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
        d.getUTCMonth()
      ]
    } ${d.getUTCDate()}${withYear ? ', ' + d.getUTCFullYear() : ''}`;
  };
  return `${fmt(s, true)} – ${fmt(e, !sameYear)}`;
}

export function TripListView({trips}: {trips: Trip[]}) {
  const t = useTranslations('Calendar.list');
  const locale = useLocale();
  const langKey: 'zh' | 'en' | 'ja' =
    locale === 'zh-TW' ? 'zh' : locale === 'ja' ? 'ja' : 'en';

  if (trips.length === 0) {
    return (
      <section className="bg-off-white text-ink">
        <div className="mx-auto max-w-[1100px] px-6 pb-12 md:px-20">
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
            {t('empty')}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-off-white text-ink">
      <div className="mx-auto max-w-[1100px] px-6 pb-12 md:px-20">
        <ul className="flex flex-col gap-4">
          {trips.map((trip) => {
            const days = diffDays(trip.start_date, trip.end_date);
            const nights = Math.max(0, days - 1);
            const dest = DEST_LABEL[trip.destination] ?? {zh: trip.destination, en: trip.destination};
            const kind = KIND_LABEL[trip.kind] ?? {zh: trip.kind, en: trip.kind};
            const accent = DEST_ACCENT[trip.destination] ?? 'bg-navy-800';
            const isSoldOut = trip.status === 'sold_out';
            const isClosed = trip.status === 'closed';

            return (
              <li key={trip.id}>
                <Link
                  href={`/trips/${trip.slug}`}
                  aria-label={t('ariaRow')}
                  className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-coral hover:shadow-lg md:flex-row"
                >
                  <div
                    className={cn(
                      'h-32 w-full shrink-0 transition-transform duration-300 group-hover:scale-[1.04] md:h-auto md:w-[180px]',
                      accent
                    )}
                    style={
                      trip.cover_image
                        ? {
                            backgroundImage: `url(${trip.cover_image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }
                        : undefined
                    }
                  />
                  <div className="flex flex-1 flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between md:gap-6 md:p-6">
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-en text-[11px] font-bold tracking-[0.2em] text-coral uppercase">
                          {dest[langKey]} · {t('duration', {days, nights})}
                        </span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                            KIND_BADGE[trip.kind] ?? KIND_BADGE.other
                          )}
                        >
                          {kind[langKey]}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-bold text-navy-900 group-hover:text-coral">
                        {trip.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-en text-sm text-gray-500">
                        <span>{formatRange(trip.start_date, trip.end_date, locale)}</span>
                        {trip.short_description ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {trip.short_description}
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            'inline-flex items-center gap-1',
                            isSoldOut ? 'text-gray-400' : 'text-gray-600'
                          )}
                        >
                          {isSoldOut
                            ? t('soldOut')
                            : t('seats', {
                                available: trip.available_seats,
                                capacity: trip.capacity
                              })}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <p className="font-en text-xl font-bold text-navy-900 md:text-2xl">
                        NT$ {trip.price_twd.toLocaleString()}
                      </p>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-en text-sm font-semibold transition',
                          isSoldOut || isClosed
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-coral text-white group-hover:brightness-110 group-hover:shadow-md'
                        )}
                      >
                        {isSoldOut ? t('waitlist') : isClosed ? t('closed') : t('book')}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
