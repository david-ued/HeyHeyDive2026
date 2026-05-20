import {useTranslations} from 'next-intl';
import {ChevronDown} from 'lucide-react';
import {Link} from '@/i18n/navigation';

const CATEGORIES = [
  {key: 'courses', qs: ['q1', 'q2', 'q3', 'q4', 'q5']},
  {key: 'trips', qs: ['q1', 'q2', 'q3', 'q4', 'q5']},
  {key: 'gear', qs: ['q1', 'q2', 'q3', 'q4']},
  {key: 'booking', qs: ['q1', 'q2', 'q3', 'q4']}
] as const;

export function FAQPage() {
  const t = useTranslations('FAQ');

  return (
    <>
      {/* Header */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 px-6 py-20 text-center md:py-24">
          <p className="font-en text-xs font-bold tracking-[0.3em] text-gold">
            {t('kicker')}
          </p>
          <h1 className="font-heading text-4xl font-bold md:text-5xl">
            {t('title')}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-gray-300">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Categories + Accordion */}
      <section className="bg-off-white text-ink">
        <div className="mx-auto flex max-w-[900px] flex-col gap-14 px-6 py-20 md:py-24">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="flex flex-col gap-5">
              <header className="flex flex-col gap-1">
                <p className="font-en text-[12px] font-bold tracking-[0.2em] text-coral">
                  {t(`categories.${cat.key}.kicker`)}
                </p>
                <h2 className="font-heading text-2xl font-bold text-navy-900 md:text-[28px]">
                  {t(`categories.${cat.key}.title`)}
                </h2>
              </header>

              <div className="flex flex-col gap-3">
                {cat.qs.map((q) => (
                  <details
                    key={q}
                    className="group rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-navy-900 [&::-webkit-details-marker]:hidden">
                      <span className="flex-1">
                        {t(`categories.${cat.key}.items.${q}.q`)}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                      {t(`categories.${cat.key}.items.${q}.a`)}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-800 text-white">
        <div className="mx-auto flex max-w-[800px] flex-col items-center gap-5 px-6 py-16 text-center">
          <h2 className="font-heading text-2xl font-bold md:text-[28px]">
            {t('cta.title')}
          </h2>
          <p className="text-sm text-gray-300">{t('cta.subline')}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-coral px-6 py-3 font-en text-sm font-semibold text-white hover:brightness-110"
            >
              {t('cta.contact')}
            </Link>
            <Link
              href="/calendar"
              className="rounded-full border border-white/60 px-6 py-3 font-en text-sm font-semibold text-white hover:bg-white/10"
            >
              {t('cta.calendar')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
