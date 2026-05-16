import {useTranslations} from 'next-intl';
import {ArrowRight, Calendar, MapPin} from 'lucide-react';
import {Link} from '@/i18n/navigation';

const TRIPS = ['trip1', 'trip2', 'trip3', 'trip4'] as const;

const TRIP_GRADIENTS: Record<(typeof TRIPS)[number], string> = {
  trip1: 'from-aqua/40 to-navy-800',
  trip2: 'from-coral/40 to-navy-800',
  trip3: 'from-gold/40 to-navy-800',
  trip4: 'from-navy-500 to-navy-800'
};

export function SeasonalTrips() {
  const t = useTranslations('Home.trips');
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
          {TRIPS.map((key) => (
            <article
              key={key}
              className="flex flex-col overflow-hidden rounded-lg bg-navy-700"
            >
              <div
                className={`relative h-40 w-full bg-gradient-to-br ${TRIP_GRADIENTS[key]}`}
              >
                <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 font-en text-[10px] font-semibold tracking-wider text-white backdrop-blur">
                  {t(`${key}.badge`)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="font-heading text-lg font-bold text-white">
                  {t(`${key}.title`)}
                </h3>
                <div className="flex flex-col gap-1.5 font-en text-xs text-gray-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {t(`${key}.dates`)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {t(`${key}.location`)}
                  </span>
                </div>
                <div className="mt-auto flex items-end justify-between pt-2">
                  <p className="font-en text-base font-bold text-gold">
                    {t(`${key}.price`)}
                  </p>
                  <Link
                    href="/calendar"
                    className="inline-flex items-center gap-1 text-xs text-white hover:text-gold"
                  >
                    {t('book')} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
