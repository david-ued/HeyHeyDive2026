import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Placeholder');

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-deep-ocean sm:text-7xl">
          {t('brand')}
        </h1>
        <p className="mt-6 text-lg text-sea-mist sm:text-xl">{t('subtitle')}</p>
        <p className="mt-2 text-sm italic text-sea-mist">{t('tagline')}</p>
        <p className="mt-16 text-xs uppercase tracking-[0.3em] text-coral">
          ⊛ {t('status')} ⊛
        </p>
      </div>
    </main>
  );
}
