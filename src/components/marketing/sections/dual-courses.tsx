import {useTranslations} from 'next-intl';
import {ArrowRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';

const COURSES = [
  {key: 'aida', accent: 'from-aqua/30 to-navy-700'},
  {key: 'padi', accent: 'from-coral/30 to-navy-700'}
] as const;

export function DualCourses() {
  const t = useTranslations('Home.courses');
  return (
    <section className="bg-off-white text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-20 md:px-20">
        <header className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-heading text-2xl font-bold md:text-[28px]">
            {t('title')}
          </h2>
          <p className="font-en text-sm tracking-wider text-gray-500">
            {t('subtitle')}
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {COURSES.map(({key, accent}) => (
            <article
              key={key}
              className="flex flex-col overflow-hidden rounded-lg bg-navy-800 text-white"
            >
              <div
                className={`relative h-60 w-full bg-gradient-to-br ${accent}`}
              >
                <span className="absolute left-6 top-6 font-en text-[11px] font-semibold tracking-[0.2em] text-gold">
                  {t(`${key}.kicker`)}
                </span>
                <p className="absolute bottom-6 left-6 font-heading text-3xl font-bold">
                  {t(`${key}.label`)}
                </p>
              </div>
              <div className="flex flex-col gap-4 p-7">
                <h3 className="font-heading text-xl font-bold">
                  {t(`${key}.name`)}
                </h3>
                <p className="text-sm leading-relaxed text-gray-300">
                  {t(`${key}.desc`)}
                </p>
                <Link
                  href={`/courses/${key}`}
                  className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-coral px-5 py-2.5 font-en text-sm font-semibold text-white transition hover:brightness-110"
                >
                  {t('cta')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
