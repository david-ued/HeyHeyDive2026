import {getTranslations, getLocale} from 'next-intl/server';
import {ArrowRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {listPublicCourses} from '@/lib/cms/queries';
import {pickText} from '@/lib/cms/i18n';
import {deriveSimpleStatus, statusBadgeClass, statusLabel} from '@/lib/cms/status';

const ACCENT: Record<string, string> = {
  aida: 'from-aqua/30 to-navy-700',
  padi: 'from-coral/30 to-navy-700',
  other: 'from-navy-500 to-navy-700'
};

const SYSTEM_KICKER: Record<string, string> = {
  aida: 'FREEDIVING',
  padi: 'SCUBA',
  other: 'COURSE'
};

export async function DualCourses() {
  const t = await getTranslations('Home.courses');
  const locale = await getLocale();
  const courses = await listPublicCourses();

  if (courses.length === 0) return null;

  return (
    <section className="reveal bg-off-white text-ink">
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
          {courses.map((course) => {
            const derived = deriveSimpleStatus(course);
            return (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className={`group matte hover-lift flex flex-col overflow-hidden rounded-lg bg-navy-800 text-white transition ${derived === 'closed' ? 'opacity-70' : ''}`}
            >
              <div
                className={`relative h-60 w-full bg-gradient-to-br ${ACCENT[course.system] ?? ACCENT.other}`}
                style={
                  course.cover_image
                    ? {
                        backgroundImage: `url(${course.cover_image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }
                    : undefined
                }
              >
                {course.cover_image ? (
                  <div aria-hidden className="absolute inset-0 bg-black/30" />
                ) : null}
                <span className="absolute left-6 top-6 font-en text-[11px] font-semibold tracking-[0.2em] text-gold">
                  {SYSTEM_KICKER[course.system] ?? SYSTEM_KICKER.other}
                </span>
                <span
                  className={`absolute right-6 top-6 rounded-full border px-2.5 py-1 font-en text-[11px] font-semibold tracking-wider ${statusBadgeClass(derived)}`}
                >
                  {statusLabel(derived, locale)}
                </span>
                <p className="absolute bottom-6 left-6 font-heading text-3xl font-bold">
                  {course.system.toUpperCase()}
                </p>
              </div>
              <div className="flex flex-col gap-4 p-7">
                <h3 className="font-heading text-xl font-bold transition group-hover:text-gold">
                  {pickText(course.title, course.title_en, course.title_ja, locale)}
                </h3>
                <p className="text-sm leading-relaxed text-gray-300">
                  {pickText(course.description, course.description_en, course.description_ja, locale)}
                </p>
                <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-coral px-5 py-2.5 font-en text-sm font-semibold text-white transition group-hover:brightness-110">
                  {t('cta')}{' '}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
