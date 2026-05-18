import {DiveSiteCards} from '@/components/marketing/sections/dive-site-cards';
import {getTranslations} from 'next-intl/server';

export default async function DiveSitesIndex() {
  const t = await getTranslations('Home.sites');
  return (
    <>
      <section className="bg-navy-900 pt-24 pb-12 text-center md:pt-32">
        <div className="mx-auto max-w-[1200px] px-6 md:px-20">
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-3 font-en text-sm tracking-wider text-gray-400">
            {t('subtitle')}
          </p>
        </div>
      </section>
      <DiveSiteCards />
    </>
  );
}
