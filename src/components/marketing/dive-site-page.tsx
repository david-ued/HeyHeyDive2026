import {useTranslations} from 'next-intl';
import {ArrowRight, MapPin, Thermometer, Waves} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {buildContentT, type DeepContent} from '@/lib/cms/content';

const HERO_GRADIENT: Record<string, string> = {
  ludao: 'from-aqua/40 via-navy-700 to-navy-900',
  lanyu: 'from-coral/40 via-navy-700 to-navy-900',
  liuqiu: 'from-gold/40 via-navy-700 to-navy-900'
};

export function DiveSitePage({
  slug,
  content,
  coverImage
}: {
  slug: string;
  content?: DeepContent;
  coverImage?: string | null;
}) {
  const tFallback = useTranslations(`DiveSite.${slug}`);
  const t = buildContentT(content, tFallback);
  const tShared = useTranslations('DiveSite.shared');

  return (
    <>
      {/* Hero */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${HERO_GRADIENT[slug] ?? 'from-navy-500 via-navy-700 to-navy-900'}`}
        style={
          coverImage
            ? {
                backgroundImage: `linear-gradient(rgba(11,20,40,0.55), rgba(11,20,40,0.65)), url(${coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }
            : undefined
        }
      >
        {!coverImage ? (
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.1] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]"
          />
        ) : null}
        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-24 text-center md:px-20 md:py-32">
          <p className="font-en text-[13px] font-semibold tracking-[0.2em] text-gold">
            {t('kicker')}
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-wider text-white md:text-6xl">
            {t('name')}
          </h1>
          <p className="font-en text-base tracking-wide text-gray-200 md:text-lg">
            {t('en')}
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-base leading-relaxed text-gray-200">
            {t('intro')}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 font-en text-xs tracking-wider text-gray-200">
            <Stat icon={<MapPin className="h-4 w-4" />} label={t('region')} />
            <Stat icon={<Thermometer className="h-4 w-4" />} label={t('temp')} />
            <Stat icon={<Waves className="h-4 w-4" />} label={t('viz')} />
          </div>
        </div>
      </section>

      {/* Narratives — alternating */}
      {(['narr1', 'narr2', 'narr3'] as const).map((key, i) => (
        <section
          key={key}
          className={i % 2 === 0 ? 'bg-navy-900' : 'bg-navy-800'}
        >
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 px-6 py-20 md:flex-row md:px-20">
            <div
              className={`h-72 w-full rounded-lg bg-gradient-to-br ${
                HERO_GRADIENT[slug]
              } md:flex-1 ${i % 2 === 1 ? 'md:order-2' : ''}`}
            />
            <div className="flex flex-col gap-4 md:flex-1">
              <p className="font-en text-[12px] font-semibold tracking-[0.2em] text-gold">
                {t(`${key}.kicker`)}
              </p>
              <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">
                {t(`${key}.title`)}
              </h2>
              <p className="text-base leading-relaxed text-gray-300">
                {t(`${key}.body`)}
              </p>
            </div>
          </div>
        </section>
      ))}

      {/* Sea life */}
      <section className="reveal bg-navy-900">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-20 md:px-20">
          <h2 className="font-heading text-2xl font-bold text-white md:text-[28px]">
            {t('seaTitle')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(['s1', 's2', 's3', 's4'] as const).map((s) => (
              <div
                key={s}
                className={`flex aspect-square flex-col justify-end rounded-lg bg-gradient-to-br ${HERO_GRADIENT[slug]} p-5 text-white`}
              >
                <p className="font-heading text-base font-bold">
                  {t(`sea.${s}.name`)}
                </p>
                <p className="font-en text-[11px] tracking-wider text-gray-200">
                  {t(`sea.${s}.en`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trips at this site */}
      <section className="reveal bg-off-white text-ink">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-20 md:px-20">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-bold md:text-[28px]">
              {t('tripsTitle')}
            </h2>
            <p className="font-en text-sm tracking-wider text-gray-500">
              {t('tripsSub')}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {(['t1', 't2', 't3'] as const).map((tr) => (
              <article
                key={tr}
                className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm"
              >
                <div
                  className={`h-44 w-full bg-gradient-to-br ${HERO_GRADIENT[slug]}`}
                />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="font-heading text-lg font-bold">
                    {t(`trips.${tr}.title`)}
                  </h3>
                  <p className="font-en text-xs text-gray-500">
                    {t(`trips.${tr}.dates`)}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <p className="font-en text-base font-bold text-coral">
                      {t(`trips.${tr}.price`)}
                    </p>
                    <Link
                      href="/calendar"
                      className="inline-flex items-center gap-1 font-en text-xs font-semibold text-ink"
                    >
                      {tShared('book')} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Course CTA */}
      <section className="reveal bg-navy-800">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-16 text-center md:px-20">
          <p className="font-en text-[12px] font-semibold tracking-[0.2em] text-gold">
            {tShared('coursesKicker')}
          </p>
          <h2 className="font-heading text-2xl font-bold text-white md:text-[28px]">
            {tShared('coursesTitle')}
          </h2>
          <p className="max-w-xl text-sm text-gray-300">
            {tShared('coursesDesc')}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/courses/aida"
              className="rounded-full bg-coral px-5 py-2.5 font-en text-sm font-semibold text-white hover:brightness-110"
            >
              AIDA
            </Link>
            <Link
              href="/courses/padi"
              className="rounded-full border border-white/60 px-5 py-2.5 font-en text-sm font-semibold text-white hover:bg-white/10"
            >
              PADI
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({icon, label}: {icon: React.ReactNode; label: string}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3.5 py-1.5">
      {icon}
      {label}
    </span>
  );
}
