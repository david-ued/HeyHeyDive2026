import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

export function StubPage({namespace}: {namespace: string}) {
  const t = useTranslations(namespace);
  return (
    <section className="matte matte-soft bg-navy-900 text-white">
      <div className="mx-auto flex max-w-[800px] flex-col items-center gap-6 px-6 py-32 text-center">
        <p
          className="animate-fade-up font-en text-xs font-bold tracking-[0.3em] text-gold"
          style={{animationDelay: '60ms'}}
        >
          {t('kicker')}
        </p>
        <h1
          className="animate-fade-up font-heading text-4xl font-bold md:text-5xl"
          style={{animationDelay: '140ms'}}
        >
          {t('title')}
        </h1>
        <p
          className="animate-fade-up text-base leading-relaxed text-gray-300"
          style={{animationDelay: '220ms'}}
        >
          {t('body')}
        </p>
        <Link
          href="/"
          className="animate-fade-up mt-4 rounded-full bg-coral px-6 py-3 font-en text-sm font-semibold transition hover:brightness-110 hover:scale-[1.02]"
          style={{animationDelay: '300ms'}}
        >
          {t('cta')}
        </Link>
      </div>
    </section>
  );
}
