import {getTranslations, getLocale} from 'next-intl/server';
import {ArrowRight, Calendar, MapPin} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {listPublicTrips} from '@/lib/cms/queries';
import {formatPriceTWD, formatTripDates, pickText} from '@/lib/cms/i18n';
import {deriveTripStatus, statusBadgeClass, statusLabel} from '@/lib/cms/status';
import type {TripDestination} from '@/lib/cms/types';

const GRADIENTS: Record<TripDestination, string> = {
  ludao: 'from-aqua/40 to-navy-800',
  lanyu: 'from-coral/40 to-navy-800',
  liuqiu: 'from-gold/40 to-navy-800',
  kenting: 'from-navy-500 to-navy-800',
  other: 'from-navy-500 to-navy-800'
};

const DESTINATION_LABEL_ZH: Record<TripDestination, string> = {
  ludao: '綠島',
  lanyu: '蘭嶼',
  liuqiu: '小琉球',
  kenting: '墾丁',
  other: '其他'
};

const DESTINATION_LABEL_EN: Record<TripDestination, string> = {
  ludao: 'Ludao',
  lanyu: 'Lanyu',
  liuqiu: 'Liuqiu',
  kenting: 'Kenting',
  other: 'Other'
};

export async function SeasonalTrips() {
  const t = await getTranslations('Home.trips');
  const locale = await getLocale();
  const all = await listPublicTrips();
  // Surface future / current trips first, push expired to the end.
  const now = new Date();
  const trips = [...all]
    .sort((a, b) => {
      const aExp = deriveTripStatus(a, now) === 'expired';
      const bExp = deriveTripStatus(b, now) === 'expired';
      if (aExp !== bExp) return aExp ? 1 : -1;
      return a.start_date.localeCompare(b.start_date);
    })
    .slice(0, 4);

  if (trips.length === 0) return null;

  return (
    <section className="bg-navy-900">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-20 md:px-20">
        <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white md:text-[28px]">
              {t('title')}
            </h2>
            <p className="font-en text-sm tracking-wider text-gray-400 mt-1">
              {t('subtitle')}
            </p>
          </div>
          <Link
            href="/calendar"
            className="font-en text-[13px] font-semibold tracking-[0.1em] text-gold hover:underline"
          >
            {t('viewAll')} →
          </Link>
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {trips.map((trip) => {
            const dest = trip.destination as TripDestination;
            const label =
              locale === 'en'
                ? DESTINATION_LABEL_EN[dest]
                : DESTINATION_LABEL_ZH[dest];
            const derived = deriveTripStatus(trip, now);
            const dimmed = derived === 'expired' || derived === 'closed';
            return (
              <article
                key={trip.id}
                className={`flex flex-col overflow-hidden rounded-lg bg-navy-700 ${dimmed ? 'opacity-70' : ''}`}
              >
                <div
                  className={`relative h-40 w-full bg-gradient-to-br ${GRADIENTS[dest] ?? GRADIENTS.other}`}
                >
                  <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 font-en text-[10px] font-semibold tracking-wider text-white backdrop-blur">
                    {dest.toUpperCase()}
                  </span>
                  <span
                    className={`absolute left-3 top-3 rounded-full border px-2 py-1 font-en text-[10px] font-semibold tracking-wider backdrop-blur ${statusBadgeClass(derived)}`}
                  >
                    {statusLabel(derived, locale)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="font-heading text-lg font-bold text-white">
                    {pickText(trip.title, trip.title_en, locale)}
                  </h3>
                  <div className="flex flex-col gap-1.5 font-en text-xs text-gray-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatTripDates(trip.start_date, trip.end_date, locale)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {label}
                    </span>
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-2">
                    <p className="font-en text-base font-bold text-gold">
                      {formatPriceTWD(trip.price_twd)}
                    </p>
                    <Link
                      href={`/trips/${trip.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-white hover:text-gold"
                    >
                      {t('book')} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
