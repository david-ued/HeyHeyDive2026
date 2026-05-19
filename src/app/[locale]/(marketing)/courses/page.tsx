import {DualCourses} from '@/components/marketing/sections/dual-courses';
import {getTranslations} from 'next-intl/server';

export default async function CoursesIndex() {
  const t = await getTranslations('Home.courses');
  return (
    <>
      <section className="bg-navy-900 pt-24 pb-12 text-center md:pt-32">
        <div className="mx-auto max-w-[1200px] px-6 md:px-20">
          <p
            className="animate-fade-up font-en text-xs font-bold tracking-[0.3em] text-gold"
            style={{animationDelay: '60ms'}}
          >
            COURSES
          </p>
          <h1
            className="animate-fade-up mt-3 font-heading text-4xl font-bold text-white md:text-5xl"
            style={{animationDelay: '140ms'}}
          >
            {t('title')}
          </h1>
          <p
            className="animate-fade-up mt-3 font-en text-sm tracking-wider text-gray-400"
            style={{animationDelay: '220ms'}}
          >
            {t('subtitle')}
          </p>
        </div>
      </section>
      <DualCourses />
    </>
  );
}
