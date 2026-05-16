'use client';

import {useState} from 'react';
import {Menu, X} from 'lucide-react';
import {InstagramIcon, FacebookIcon, LineIcon} from './brand-icons';
import {useTranslations, useLocale} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {cn} from '@/lib/utils';

const NAV_ITEMS = [
  {key: 'about', href: '/about'},
  {key: 'courses', href: '/courses'},
  {key: 'sites', href: '/dive-sites'},
  {key: 'calendar', href: '/calendar'},
  {key: 'merch', href: '/merch'},
  {key: 'faq', href: '/faq'}
] as const;

export function SiteHeader() {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const locale = useLocale();
  const otherLocale = routing.locales.find((l) => l !== locale) ?? 'en';
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/80">
      {/* Desktop bar */}
      <div className="hidden md:flex h-[60px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-sm border border-white/90 font-en text-[10px] font-bold tracking-[0.1em] text-white">
            HH
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          {NAV_ITEMS.map(({key, href}) => (
            <Link
              key={key}
              href={href}
              className="font-en text-xs font-medium tracking-[0.08em] text-white/90 transition hover:text-gold"
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-white">
          <SocialIcons />
          <Link
            href={pathname}
            locale={otherLocale}
            className="font-en text-[11px] font-medium tracking-wide text-white/90 transition hover:text-gold"
          >
            {locale === 'zh-TW' ? '🇹🇼 ZH' : '🇬🇧 EN'} / {otherLocale === 'en' ? 'EN' : 'ZH'}
          </Link>
        </div>
      </div>

      {/* Mobile bar */}
      <div className="md:hidden flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-sm border border-white/90 font-en text-[10px] font-bold tracking-[0.1em] text-white">
            HH
          </span>
        </Link>
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-white"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'md:hidden overflow-hidden bg-navy-900 transition-[max-height] duration-300',
          open ? 'max-h-[600px]' : 'max-h-0'
        )}
      >
        <nav className="flex flex-col px-6 py-2">
          {NAV_ITEMS.map(({key, href}) => (
            <Link
              key={key}
              href={href}
              onClick={() => setOpen(false)}
              className="border-b border-white/5 py-3.5 font-en text-sm font-medium tracking-wide text-white"
            >
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-center gap-4 py-5 text-white">
          <SocialIcons />
        </div>
        <div className="flex justify-center pb-5">
          <Link
            href={pathname}
            locale={otherLocale}
            onClick={() => setOpen(false)}
            className="font-en text-xs font-medium tracking-wide text-gray-300"
          >
            {locale === 'zh-TW' ? '🇹🇼 ZH-TW' : '🇬🇧 EN'} →{' '}
            {otherLocale === 'en' ? 'EN' : 'ZH-TW'}
          </Link>
        </div>
      </div>
    </header>
  );
}

function SocialIcons() {
  return (
    <>
      <a
        href="https://line.me"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="LINE"
        className="transition hover:text-gold"
      >
        <LineIcon className="h-5 w-5" />
      </a>
      <a
        href="https://www.instagram.com/heyheydive"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Instagram"
        className="transition hover:text-gold"
      >
        <InstagramIcon className="h-5 w-5" />
      </a>
      <a
        href="https://www.facebook.com"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Facebook"
        className="transition hover:text-gold"
      >
        <FacebookIcon className="h-5 w-5" />
      </a>
    </>
  );
}
