import {useTranslations} from 'next-intl';

export function Newsletter() {
  const t = useTranslations('Home.newsletter');
  return (
    <section className="reveal bg-navy-800">
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-6 px-6 py-20 text-center md:py-24">
        <h2 className="font-heading text-2xl font-bold text-white md:text-[28px]">
          {t('title')}
        </h2>
        <p className="font-en text-sm tracking-wider text-gray-400">
          {t('subtitle')}
        </p>
        <p className="text-[15px] text-gray-300">{t('description')}</p>
        <form
          action="#"
          method="post"
          className="mt-2 flex w-full max-w-[500px] flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            className="h-11 flex-1 rounded-full bg-navy-700 px-5 font-en text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-coral"
          />
          <button
            type="submit"
            className="h-11 rounded-full bg-coral px-6 font-en text-sm font-semibold text-white transition hover:brightness-110"
          >
            {t('button')}
          </button>
        </form>
      </div>
    </section>
  );
}
