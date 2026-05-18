import {useTranslations} from 'next-intl';
import {
  ArrowRight,
  Award,
  Calendar,
  ChevronRight,
  Clock,
  Droplets,
  Users
} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {buildContentT, type DeepContent} from '@/lib/cms/content';

const HERO_GRADIENT: Record<string, string> = {
  aida: 'from-aqua/30 via-navy-700 to-navy-900',
  padi: 'from-coral/30 via-navy-700 to-navy-900'
};

const STEPS = ['theory', 'pool', 'open', 'cert'] as const;

export function CourseDetailPage({
  system,
  content,
  bookingForm
}: {
  system: string;
  content?: DeepContent;
  bookingForm?: React.ReactNode;
}) {
  const tFallback = useTranslations(`Course.${system}`);
  const t = buildContentT(content, tFallback);
  const tShared = useTranslations('Course.shared');

  return (
    <>
      {/* Hero & Course Info */}
      <section className={`relative bg-gradient-to-br ${HERO_GRADIENT[system] ?? 'from-navy-500 via-navy-700 to-navy-900'}`}>
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div className="relative mx-auto max-w-[1440px] px-6 py-20 md:px-16 md:py-28">
          <p className="font-en text-[12px] font-semibold tracking-[0.25em] text-gold">
            {t('kicker')}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-wider text-white md:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-3 font-en text-lg text-gray-200">{t('subtitle')}</p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-200">
            {t('intro')}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/calendar"
              className="rounded-full bg-coral px-6 py-3 font-en text-sm font-semibold text-white hover:brightness-110"
            >
              {tShared('viewSchedule')}
            </Link>
            <a
              href="#curriculum"
              className="rounded-full border border-white/60 px-6 py-3 font-en text-sm font-semibold text-white hover:bg-white/10"
            >
              {tShared('viewCurriculum')}
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            <InfoChip icon={<Clock />} label={tShared('duration')} value={t('info.duration')} />
            <InfoChip icon={<Users />} label={tShared('groupSize')} value={t('info.groupSize')} />
            <InfoChip icon={<Award />} label={tShared('prereq')} value={t('info.prereq')} />
            <InfoChip icon={<Droplets />} label={tShared('dives')} value={t('info.dives')} />
          </div>
        </div>
      </section>

      {/* Curriculum & Pricing */}
      <section id="curriculum" className="bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-16">
          <h2 className="font-heading text-2xl font-bold md:text-[32px]">
            {t('curriculum.title')}
          </h2>
          <p className="mt-2 text-base text-gray-500">{t('curriculum.subtitle')}</p>

          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_360px]">
            <ol className="flex flex-col gap-4">
              {STEPS.map((step, i) => (
                <li
                  key={step}
                  className="flex gap-5 rounded-lg border border-gray-200 bg-white p-6"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-coral/15 font-en text-base font-bold text-coral">
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-2">
                    <p className="font-heading text-lg font-bold text-navy-900">
                      {t(`curriculum.steps.${step}.title`)}
                    </p>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {t(`curriculum.steps.${step}.body`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <aside className="flex h-fit flex-col gap-4 rounded-lg border-2 border-coral bg-white p-7">
              <p className="font-en text-xs font-semibold tracking-[0.2em] text-gray-500">
                {tShared('priceLabel')}
              </p>
              <p className="font-heading text-4xl font-bold text-navy-900">
                {t('price.amount')}
              </p>
              <p className="text-sm text-gray-500">{t('price.note')}</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-gray-700">
                {(['l1', 'l2', 'l3', 'l4'] as const).map((l) => (
                  <li key={l} className="flex items-start gap-2">
                    <span className="text-emerald-600">✓</span>
                    {t(`price.includes.${l}`)}
                  </li>
                ))}
              </ul>
              <Link
                href="/calendar"
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 font-en text-sm font-semibold text-white hover:brightness-110"
              >
                {tShared('enroll')} <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Equipment & Booking flow */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-16">
          <h2 className="font-heading text-2xl font-bold md:text-[32px]">
            {tShared('equipTitle')}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(['e1', 'e2', 'e3', 'e4'] as const).map((e) => (
              <div
                key={e}
                className="rounded-lg border border-navy-700 bg-navy-800 p-5"
              >
                <p className="font-heading text-base font-bold">
                  {t(`equipment.${e}.name`)}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {t(`equipment.${e}.note`)}
                </p>
              </div>
            ))}
          </div>

          <h3 className="mt-12 font-heading text-xl font-bold">
            {tShared('flowTitle')}
          </h3>
          <ol className="mt-4 flex flex-col gap-3 md:flex-row md:gap-4">
            {(['f1', 'f2', 'f3', 'f4'] as const).map((f, i) => (
              <li
                key={f}
                className="flex-1 rounded-lg border border-navy-700 bg-navy-800 p-5"
              >
                <p className="font-en text-xs font-bold tracking-wider text-gold">
                  STEP {i + 1}
                </p>
                <p className="mt-2 font-heading text-base font-bold">
                  {t(`flow.${f}.title`)}
                </p>
                <p className="mt-1 text-sm text-gray-400">{t(`flow.${f}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Schedule + FAQ + CTA */}
      <section className="bg-off-white text-ink">
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-16">
          <h2 className="font-heading text-2xl font-bold md:text-[32px]">
            {tShared('scheduleTitle')}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(['s1', 's2', 's3'] as const).map((s) => (
              <Link
                key={s}
                href="/calendar"
                className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5 hover:border-coral"
              >
                <div className="flex flex-col gap-1">
                  <p className="inline-flex items-center gap-1.5 font-en text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {t(`schedule.${s}.dates`)}
                  </p>
                  <p className="font-heading text-base font-bold text-navy-900">
                    {t(`schedule.${s}.location`)}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-coral" />
              </Link>
            ))}
          </div>

          <h2 className="mt-16 font-heading text-2xl font-bold md:text-[32px]">
            {tShared('faqTitle')}
          </h2>
          <div className="mt-6 flex flex-col gap-3">
            {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => (
              <details
                key={q}
                className="group rounded-lg border border-gray-200 bg-white p-5"
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium text-navy-900">
                  {t(`faq.${q}.q`)}
                  <ChevronRight className="h-4 w-4 text-gray-400 transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {t(`faq.${q}.a`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {bookingForm}

      <section className="bg-navy-800 text-white">
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-5 px-6 py-16 text-center">
          <h2 className="font-heading text-2xl font-bold md:text-[32px]">
            {t('cta.title')}
          </h2>
          <p className="text-base text-gray-300">{t('cta.subline')}</p>
          <Link
            href="/calendar"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-coral px-7 py-3.5 font-en text-base font-semibold text-white hover:brightness-110"
          >
            {tShared('enroll')} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

function InfoChip({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-4 backdrop-blur">
      <span className="text-coral [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <div className="flex flex-col">
        <p className="font-en text-[11px] tracking-wider text-gray-300">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
