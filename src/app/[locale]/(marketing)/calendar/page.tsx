import {useTranslations} from 'next-intl';
import {ArrowRight, MapPin} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {CalendarSection} from '@/components/marketing/sections/calendar-section';
import {LineIcon} from '@/components/marketing/brand-icons';

const UPCOMING = [
  {slug: 'ludao-4d3n', site: 'ludao', accent: 'bg-navy-800'},
  {slug: 'liuqiu-2d1n', site: 'liuqiu', accent: 'bg-navy-700'},
  {slug: 'lanyu-5d4n', site: 'lanyu', accent: 'bg-navy-900'}
] as const;

export default function CalendarPage() {
  const t = useTranslations('Calendar');
  return (
    <>
      {/* Page header */}
      <section className="bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 pt-12 pb-2 md:px-30 md:pt-16">
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

      <CalendarSection />

      {/* Upcoming Trips */}
      <section className="bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-30 md:py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy-900 md:text-[28px]">
                {t('upcoming.title')}
              </h2>
              <p className="mt-1 font-en text-xs font-semibold tracking-[0.2em] text-gray-400">
                {t('upcoming.titleEn')}
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
            {UPCOMING.map(({slug, site, accent}) => (
              <article
                key={slug}
                className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white md:flex-row"
              >
                <div className={`${accent} h-44 w-full shrink-0 md:h-auto md:w-[280px]`} />
                <div className="flex flex-1 items-center justify-between gap-6 p-6">
                  <div className="flex flex-col gap-2">
                    <p className="font-en text-[11px] font-bold tracking-[0.2em] text-coral">
                      {t(`upcoming.items.${site}.kicker`)}
                    </p>
                    <h3 className="font-heading text-xl font-bold text-navy-900">
                      {t(`upcoming.items.${site}.title`)}
                    </h3>
                    <p className="font-en text-sm text-gray-500">
                      {t(`upcoming.items.${site}.dates`)}
                    </p>
                    <p className="inline-flex items-center gap-1.5 font-en text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />{' '}
                      {t(`upcoming.items.${site}.location`)}
                    </p>
                  </div>
                  <div className="hidden flex-col items-end gap-2 md:flex">
                    <p className="font-en text-2xl font-bold text-navy-900">
                      {t(`upcoming.items.${site}.price`)}
                    </p>
                    <Link
                      href={`/trips/${slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 font-en text-sm font-semibold text-white hover:brightness-110"
                    >
                      {t('upcoming.book')} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-30">
          <div className="grid grid-cols-2 divide-y divide-x divide-gray-200 rounded-lg border border-gray-200 bg-white md:grid-cols-4 md:divide-y-0">
            <Stat number="3" label={t('stats.month')} />
            <Stat number="3" label={t('stats.destinations')} />
            <Stat number="2" highlight label={t('stats.available')} />
            <Stat number="1" muted label={t('stats.soldOut')} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900 text-white">
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
              href="https://line.me"
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
