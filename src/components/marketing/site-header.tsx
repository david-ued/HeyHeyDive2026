'use client';

import {useState} from 'react';
import {LogIn, Menu, ShieldCheck, X} from 'lucide-react';
import {InstagramIcon, FacebookIcon, LineIcon, ThreadsIcon} from './brand-icons';
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

type Session = {email: string; isAdmin: boolean} | null;

export function SiteHeader({session}: {session: Session}) {
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
          <img
            src="/images/heyhey.jpg"
            alt="heyheydive"
            className="h-10 w-10 rounded-sm object-cover"
          />
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
            {locale === 'zh-TW' ? '🇹🇼 ZH' : '🇬🇧 EN'} /{' '}
            {otherLocale === 'en' ? 'EN' : 'ZH'}
          </Link>
          <SessionPill session={session} />
        </div>
      </div>

      {/* Mobile bar */}
      <div className="md:hidden flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/heyhey.jpg"
            alt="heyheydive"
            className="h-9 w-9 rounded-sm object-cover"
          />
        </Link>
        <div className="flex items-center gap-3">
          <SessionPill session={session} compact />
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
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'md:hidden overflow-hidden bg-navy-900 transition-[max-height] duration-300',
          open ? 'max-h-[700px]' : 'max-h-0'
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

function SessionPill({
  session,
  compact = false
}: {
  session: Session;
  compact?: boolean;
}) {
  const t = useTranslations('Nav');

  if (!session) {
    return (
      <Link
        href="/admin/login"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-coral font-en font-semibold text-white transition hover:brightness-110',
          compact ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 py-1.5 text-xs'
        )}
      >
        <LogIn className="h-3.5 w-3.5" />
        {t('signIn')}
      </Link>
    );
  }

  // Signed in. Admin gets a quick link into the console.
  return (
    <Link
      href={session.isAdmin ? '/admin' : '/'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/5 font-en text-white transition hover:bg-white/15',
        compact ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 py-1.5 text-xs'
      )}
      title={session.email}
    >
      {session.isAdmin ? (
        <ShieldCheck className="h-3.5 w-3.5 text-gold" />
      ) : (
        <LogIn className="h-3.5 w-3.5" />
      )}
      {compact ? t('account') : session.isAdmin ? t('adminConsole') : t('account')}
    </Link>
  );
}

function SocialIcons() {
  return (
    <>
      <a
        href="https://line.me/R/ti/p/@heydive"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="LINE"
        className="transition hover:text-gold"
      >
        <LineIcon className="h-5 w-5" />
      </a>
      <a
        href="https://www.instagram.com/heyhey_dive/"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Instagram"
        className="transition hover:text-gold"
      >
        <InstagramIcon className="h-5 w-5" />
      </a>
      <a
        href="https://www.facebook.com/heyheyDive/"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Facebook"
        className="transition hover:text-gold"
      >
        <FacebookIcon className="h-5 w-5" />
      </a>
      <a
        href="https://www.threads.com/@heyhey_dive"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Threads"
        className="transition hover:text-gold"
      >
        <ThreadsIcon className="h-5 w-5" />
      </a>
    </>
  );
}
