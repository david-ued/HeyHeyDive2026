import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {useTranslations} from 'next-intl';
import {ArrowRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';

const HERO_IMAGE_PATH = '/images/hero.jpg';

export function HomeHero() {
  const t = useTranslations('Home.hero');
  // Re-check each render so dropping in the file picks up without a server restart.
  const hasHeroImage = existsSync(join(process.cwd(), 'public', 'images', 'hero.jpg'));

  return (
    <section className="relative isolate overflow-hidden bg-navy-900">
      {hasHeroImage ? (
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `linear-gradient(rgba(11,20,40,0.45), rgba(11,20,40,0.7)), url(${HERO_IMAGE_PATH})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      ) : (
        <>
          {/* Decorative ocean gradient + dot pattern stand-in for hero image */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.navy-700),theme(colors.navy-900)_60%,theme(colors.ink))]" />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-[0.08] [background-image:radial-gradient(theme(colors.white)_1px,transparent_1px)] [background-size:24px_24px]"
          />
        </>
      )}

      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-6 pt-24 pb-28 md:px-20 md:pt-32 md:pb-32 lg:min-h-[680px] lg:justify-center">
        <p
          className="animate-fade-up font-en text-[13px] font-medium tracking-[0.18em] text-gold"
          style={{animationDelay: '60ms'}}
        >
          {t('seasonLabel')}
        </p>
        <h1
          className="animate-fade-up font-heading text-4xl font-bold leading-[1.1] tracking-wider text-white md:text-6xl lg:text-[56px]"
          style={{animationDelay: '160ms'}}
        >
          {t('headline')}
        </h1>
        <p
          className="animate-fade-up font-en text-base tracking-wide text-gray-300 md:text-lg"
          style={{animationDelay: '260ms'}}
        >
          {t('subtitle')}
        </p>
        <div className="animate-fade-up mt-2" style={{animationDelay: '360ms'}}>
          <Link
            href="/dive-sites"
            className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 font-en text-sm font-semibold tracking-wider text-white transition hover:brightness-110 hover:scale-[1.02]"
          >
            {t('cta')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Marquee ribbon */}
      <div className="overflow-hidden bg-gold">
        <div className="flex h-12 items-center whitespace-nowrap font-en text-[13px] font-bold tracking-[0.2em] text-ink animate-marquee">
          <MarqueeText />
          <MarqueeText />
        </div>
      </div>
    </section>
  );
}

function MarqueeText() {
  const items = [
    'S2 ITINERARY — LUDAO',
    'LIUQIU',
    'LANYU',
    'AIDA · PADI',
    'SUMMER 2026'
  ];
  return (
    <span className="flex shrink-0 items-center">
      {Array.from({length: 4}).map((_, i) => (
        <span key={i} className="flex items-center">
          {items.map((it) => (
            <span key={it} className="flex items-center px-6">
              <span>⊛</span>
              <span className="ml-3">{it}</span>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
