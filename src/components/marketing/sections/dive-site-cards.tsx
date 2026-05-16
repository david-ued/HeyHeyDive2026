import {useTranslations} from 'next-intl';
import {ArrowUpRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';

const SITES = [
  {slug: 'ludao', gradient: 'from-aqua/40 via-navy-700 to-navy-900'},
  {slug: 'lanyu', gradient: 'from-coral/30 via-navy-700 to-navy-900'},
  {slug: 'liuqiu', gradient: 'from-gold/30 via-navy-700 to-navy-900'}
] as const;

export function DiveSiteCards() {
  const t = useTranslations('Home.sites');
  return (
    <section className="bg-off-white pb-24 text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 md:px-20">
        <header className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-heading text-2xl font-bold md:text-[32px]">
            {t('title')}
          </h2>
          <p className="font-en text-sm tracking-wider text-gray-500">
            {t('subtitle')}
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {SITES.map(({slug, gradient}) => (
            <Link
              key={slug}
              href={`/dive-sites/${slug}`}
              className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`relative aspect-[16/11] w-full bg-gradient-to-br ${gradient}`}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:18px_18px]"
                />
                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 font-en text-[11px] font-semibold tracking-wide text-ink">
                  {t(`${slug}.tag`)}
                </span>
              </div>

              <div className="flex flex-col gap-3 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-xl font-bold">
                      {t(`${slug}.name`)}
                    </h3>
                    <p className="font-en text-xs tracking-wider text-gray-500">
                      {t(`${slug}.en`)}
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-500 transition group-hover:text-coral" />
                </div>
                <p className="text-sm leading-relaxed text-gray-700">
                  {t(`${slug}.desc`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
