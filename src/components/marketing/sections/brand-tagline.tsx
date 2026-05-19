import {useTranslations} from 'next-intl';
import {ArrowRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';

export function BrandTagline() {
  const t = useTranslations('Home.tagline');
  return (
    <section className="reveal bg-off-white text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-20 md:px-20 md:py-28 text-center">
        <h2 className="font-heading text-3xl font-bold md:text-[40px] tracking-wide">
          {t('main')}
        </h2>
        <p className="font-en text-base tracking-wide text-gray-500 md:text-lg">
          {t('sub')}
        </p>
        <Link
          href="/dive-sites"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 font-medium text-white transition hover:bg-coral hover:border-coral"
        >
          {t('cta')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
