import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

export function StubPage({namespace}: {namespace: string}) {
  const t = useTranslations(namespace);
  return (
    <section className="bg-navy-900 text-white">
      <div className="mx-auto flex max-w-[800px] flex-col items-center gap-6 px-6 py-32 text-center">
        <p className="font-en text-xs font-bold tracking-[0.3em] text-gold">
          {t('kicker')}
        </p>
        <h1 className="font-heading text-4xl font-bold md:text-5xl">{t('title')}</h1>
        <p className="text-base leading-relaxed text-gray-300">{t('body')}</p>
        <Link
          href="/"
          className="mt-4 rounded-full bg-coral px-6 py-3 font-en text-sm font-semibold hover:brightness-110"
        >
          {t('cta')}
        </Link>
      </div>
    </section>
  );
}
