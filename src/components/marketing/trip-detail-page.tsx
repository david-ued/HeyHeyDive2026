'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {
  ArrowRight,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Droplets,
  Info,
  MapPin,
  User,
  Anchor,
  Camera,
  PlusCircle
} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

type Slug = 'ludao-4d3n' | 'liuqiu-2d1n' | 'lanyu-5d4n';

const COVER_GRADIENT: Record<Slug, string> = {
  'ludao-4d3n': 'from-aqua/30 via-navy-700 to-navy-900',
  'liuqiu-2d1n': 'from-gold/30 via-navy-700 to-navy-900',
  'lanyu-5d4n': 'from-coral/30 via-navy-700 to-navy-900'
};

const DAYS = ['day1', 'day2', 'day3', 'day4'] as const;
const INCLUDED = ['lodging', 'tanks', 'meals', 'guide', 'insurance', 'scooter'] as const;
const NOT_INCLUDED = ['gear', 'tips', 'travel', 'photo'] as const;
const DATE_BATCHES = [
  {id: 'b1', status: 'active'},
  {id: 'b2', status: 'hot'},
  {id: 'b3', status: 'soldout'}
] as const;

export function TripDetailPage({slug}: {slug: Slug}) {
  const t = useTranslations(`Trip.${slug}`);
  const tShared = useTranslations('Trip.shared');
  const [selected, setSelected] = useState<string>('b1');
  const [openDay, setOpenDay] = useState<string>('day1');

  return (
    <>
      {/* Sticky bar */}
      <div className="sticky top-14 z-30 border-b border-navy-700 bg-navy-800/95 px-6 py-3 backdrop-blur md:top-15 md:px-16">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <p className="truncate font-heading text-base font-bold text-white md:text-lg">
            {t('title')}
          </p>
          <Link
            href="#cta"
            className="shrink-0 rounded-full bg-coral px-5 py-2 font-en text-sm font-semibold text-white hover:brightness-110"
          >
            {tShared('book')}
          </Link>
        </div>
      </div>

      {/* Cover */}
      <section className={`relative bg-gradient-to-br ${COVER_GRADIENT[slug]}`}>
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-20 md:px-16 md:py-28">
          <p className="font-en text-[12px] font-semibold tracking-[0.25em] text-gold">
            {t('kicker')}
          </p>
          <h1 className="max-w-3xl font-heading text-3xl font-bold tracking-wider text-white md:text-5xl">
            {t('title')}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-gray-200">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Overview stats */}
      <section className="bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-16">
          <h2 className="font-heading text-2xl font-bold">{tShared('overview')}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={<Calendar />} value={t('stats.days')} label={tShared('statDays')} />
            <StatCard icon={<MapPin />} value={t('stats.sites')} label={tShared('statSites')} />
            <StatCard icon={<Droplets />} value={t('stats.tanks')} label={tShared('statTanks')} />
            <StatCard icon={<Award />} value={t('stats.cert')} label={tShared('statCert')} />
          </div>
        </div>
      </section>

      {/* Date Selector */}
      <section className="bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 pb-12 md:px-16">
          <h2 className="font-heading text-2xl font-bold">{tShared('chooseBatch')}</h2>
          <div className="mt-6 flex flex-col gap-4">
            {DATE_BATCHES.map(({id, status}) => {
              const isSoldOut = status === 'soldout';
              const isActive = selected === id && !isSoldOut;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => !isSoldOut && setSelected(id)}
                  className={cn(
                    'flex items-center justify-between rounded-lg bg-white p-6 text-left transition',
                    isActive
                      ? 'border-2 border-coral'
                      : 'border border-gray-200 hover:border-gray-300',
                    isSoldOut && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <p
                    className={cn(
                      'font-medium',
                      isSoldOut ? 'text-gray-400' : 'text-navy-900'
                    )}
                  >
                    {t(`batches.${id}.dates`)}
                  </p>
                  <BatchBadge status={status} label={t(`batches.${id}.badge`)} />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Day-by-day */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-16">
          <h2 className="font-heading text-2xl font-bold">{tShared('itinerary')}</h2>
          <div className="mt-6 flex flex-col gap-3">
            {DAYS.map((d) => {
              const open = openDay === d;
              return (
                <div
                  key={d}
                  className="overflow-hidden rounded-lg border border-navy-700 bg-navy-800"
                >
                  <button
                    type="button"
                    onClick={() => setOpenDay(open ? '' : d)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <p className="font-heading text-lg font-bold text-white">
                      {t(`itinerary.${d}.title`)}
                    </p>
                    {open ? (
                      <ChevronUp className="h-5 w-5 text-gray-300" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-300" />
                    )}
                  </button>
                  {open ? (
                    <div className="border-t border-navy-700 px-6 py-4">
                      <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">
                        {t(`itinerary.${d}.body`)}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Included / Not included */}
      <section className="bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-16">
          <h2 className="font-heading text-2xl font-bold">{tShared('includes')}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-7">
              <p className="font-heading text-lg font-bold text-emerald-600">
                ✓ {tShared('included')}
              </p>
              <ul className="mt-4 space-y-2.5 text-[15px] leading-[1.8] text-gray-700">
                {INCLUDED.map((k) => (
                  <li key={k}>✓ {t(`included.${k}`)}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-7">
              <p className="font-heading text-lg font-bold text-red-500">
                ✗ {tShared('notIncluded')}
              </p>
              <ul className="mt-4 space-y-2.5 text-[15px] leading-[1.8] text-gray-700">
                {NOT_INCLUDED.map((k) => (
                  <li key={k}>✗ {t(`notIncluded.${k}`)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-16">
          <h2 className="font-heading text-2xl font-bold">{tShared('addons')}</h2>
          <p className="mt-2 text-base text-navy-500">{tShared('addonsDesc')}</p>

          <AddonGroup icon={<Anchor />} title={tShared('addonGear')} rows={['gear1', 'gear2', 'gear3', 'gear4']} slug={slug} ns="addons.gear" />
          <AddonGroup icon={<Camera />} title={tShared('addonPremium')} rows={['svc1', 'svc2', 'svc3']} slug={slug} ns="addons.svc" />
          <AddonGroup icon={<PlusCircle />} title={tShared('addonOther')} rows={['ext1', 'ext2']} slug={slug} ns="addons.ext" />

          <div className="mt-6 flex items-start gap-3 rounded-md border border-navy-700 bg-navy-800 px-5 py-4 text-xs leading-relaxed text-navy-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
            <p>{tShared('addonNote')}</p>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-[1440px] px-6 pb-12 md:px-16">
          <h2 className="font-heading text-2xl font-bold">{tShared('whoFor')}</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-4 text-[15px] leading-[1.8] text-gray-300">
              <p>{t('audience.p1')}</p>
              <p>{t('audience.p2')}</p>
            </div>
            <div className="flex flex-col gap-5 rounded-lg bg-navy-800 p-7">
              {(['cert', 'age', 'health', 'swim'] as const).map((r) => (
                <div key={r} className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coral/20 text-coral">✓</span>
                  <p className="text-sm text-gray-300">{t(`audience.req.${r}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instructor */}
      <section className="bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-16">
          <h2 className="font-heading text-2xl font-bold">{tShared('instructor')}</h2>
          <div className="mt-6 flex flex-col items-start gap-6 rounded-lg border border-gray-200 bg-white p-7 md:flex-row md:items-center">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gray-200 text-gray-400">
              <User className="h-8 w-8" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-heading text-lg font-bold">{t('instructor.name')}</p>
              <p className="font-en text-sm text-gray-500">{t('instructor.creds')}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t('instructor.bio')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cancellation policy */}
      <section className="bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 pb-12 md:px-16">
          <h2 className="font-heading text-2xl font-bold">{tShared('cancel')}</h2>
          <div className="mt-6 overflow-hidden rounded-md border border-gray-200">
            <div className="flex bg-gray-600 px-6 py-3 font-en text-sm font-semibold text-white">
              <span className="flex-1">{tShared('cancelCol1')}</span>
              <span className="flex-1">{tShared('cancelCol2')}</span>
            </div>
            {(
              [
                {k: 'r1', bg: 'bg-white'},
                {k: 'r2', bg: 'bg-gray-50'},
                {k: 'r3', bg: 'bg-white'},
                {k: 'r4', bg: 'bg-gray-50'},
                {k: 'r5', bg: 'bg-white'}
              ] as const
            ).map(({k, bg}) => (
              <div
                key={k}
                className={`flex border-t border-gray-200 px-6 py-3 text-sm ${bg}`}
              >
                <span className="flex-1 text-gray-700">{tShared(`cancelRows.${k}.when`)}</span>
                <span className="flex-1 font-medium text-navy-900">
                  {tShared(`cancelRows.${k}.fee`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="bg-navy-800 text-white">
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-5 px-6 py-16 text-center md:py-20">
          <h2 className="font-heading text-3xl font-bold md:text-[40px]">
            {t('cta.title')}
          </h2>
          <p className="text-base text-gray-300 md:text-lg">{t('cta.subline')}</p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-coral px-7 py-3.5 font-en text-base font-semibold text-white hover:brightness-110"
          >
            {tShared('bookNow')} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

function StatCard({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-7 text-center">
      <span className="text-coral [&_svg]:h-8 [&_svg]:w-8">{icon}</span>
      <p className="font-heading text-xl font-bold text-navy-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function BatchBadge({status, label}: {status: string; label: string}) {
  const cls =
    status === 'soldout'
      ? 'bg-gray-200 text-gray-500'
      : status === 'hot'
      ? 'bg-gold/20 text-gold'
      : 'bg-coral/15 text-coral';
  return (
    <span className={`rounded-full px-3 py-1 font-en text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function AddonGroup({
  icon,
  title,
  rows,
  slug,
  ns
}: {
  icon: React.ReactNode;
  title: string;
  rows: string[];
  slug: Slug;
  ns: string;
}) {
  const t = useTranslations(`Trip.${slug}`);
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <span className="text-coral [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
        <p className="font-heading text-lg font-semibold text-white">{title}</p>
      </div>
      <div className="mt-3 overflow-hidden rounded-md border border-navy-700">
        {rows.map((r, i) => (
          <div
            key={r}
            className={`flex items-center justify-between px-5 py-4 ${
              i % 2 === 0 ? 'bg-navy-800' : 'bg-navy-900'
            }`}
          >
            <span className="text-sm text-white">{t(`${ns}.${r}.name`)}</span>
            <span className="font-en text-sm font-semibold text-gold">
              {t(`${ns}.${r}.price`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
