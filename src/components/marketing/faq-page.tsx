'use client';

import {useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ChevronDown} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import type {FaqCategoryWithItems} from '@/lib/cms/types';
import {pickText} from '@/lib/cms/i18n';

type Props = {
  categories: FaqCategoryWithItems[];
  locale: string;
};

export function FAQPage({categories, locale}: Props) {
  const t = useTranslations('FAQ');

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.items.length > 0),
    [categories]
  );
  const [activeId, setActiveId] = useState<string | null>(
    visibleCategories[0]?.id ?? null
  );

  const active = visibleCategories.find((c) => c.id === activeId) ?? visibleCategories[0];

  return (
    <>
      {/* Header */}
      <section className="matte matte-soft bg-navy-900 text-white">
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 px-6 py-20 text-center md:py-24">
          <p className="font-en text-xs font-bold tracking-[0.3em] text-gold">{t('kicker')}</p>
          <h1 className="font-heading text-4xl font-bold md:text-5xl">{t('title')}</h1>
          <p className="max-w-xl text-base leading-relaxed text-gray-300">{t('subtitle')}</p>
        </div>
      </section>

      {/* Tabs + Accordion */}
      <section className="bg-off-white text-ink">
        <div className="mx-auto flex max-w-[900px] flex-col gap-10 px-6 py-16 md:py-20">
          {visibleCategories.length === 0 ? (
            <p className="rounded-md border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
              {t('empty')}
            </p>
          ) : (
            <>
              <div
                role="tablist"
                aria-label={t('tabsAriaLabel')}
                className="-mx-2 flex flex-wrap items-center gap-2 overflow-x-auto px-2 md:gap-3"
              >
                {visibleCategories.map((cat) => {
                  const isActive = cat.id === active?.id;
                  const title = pickText(cat.title, cat.title_en, cat.title_ja, locale);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`faq-panel-${cat.id}`}
                      id={`faq-tab-${cat.id}`}
                      onClick={() => setActiveId(cat.id)}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'border-coral bg-coral text-white shadow-sm'
                          : 'border-gray-200 bg-white text-navy-900 hover:border-coral hover:text-coral'
                      }`}
                    >
                      {title}
                      <span
                        className={`ml-1.5 font-en text-xs ${
                          isActive ? 'text-white/80' : 'text-gray-400'
                        }`}
                      >
                        {cat.items.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {active ? (
                <div
                  role="tabpanel"
                  id={`faq-panel-${active.id}`}
                  aria-labelledby={`faq-tab-${active.id}`}
                  key={active.id}
                  className="flex flex-col gap-5"
                >
                  <header className="flex flex-col gap-1">
                    {active.kicker ? (
                      <p className="font-en text-[12px] font-bold tracking-[0.2em] text-coral">
                        {active.kicker}
                      </p>
                    ) : null}
                    <h2 className="font-heading text-2xl font-bold text-navy-900 md:text-[28px]">
                      {pickText(active.title, active.title_en, active.title_ja, locale)}
                    </h2>
                  </header>

                  <div className="flex flex-col gap-3">
                    {active.items.map((it) => {
                      const q = pickText(it.question, it.question_en, it.question_ja, locale);
                      const a = pickText(it.answer, it.answer_en, it.answer_ja, locale);
                      return (
                        <details
                          key={it.id}
                          className="group rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300"
                        >
                          <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-navy-900 [&::-webkit-details-marker]:hidden">
                            <span className="flex-1">{q}</span>
                            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180" />
                          </summary>
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                            {a}
                          </p>
                        </details>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="matte bg-navy-800 text-white">
        <div className="mx-auto flex max-w-[800px] flex-col items-center gap-5 px-6 py-16 text-center">
          <h2 className="font-heading text-2xl font-bold md:text-[28px]">{t('cta.title')}</h2>
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
