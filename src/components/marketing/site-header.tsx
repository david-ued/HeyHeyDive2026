'use client';

import {useEffect, useRef, useState} from 'react';
import {Check, ChevronDown, LogIn, Menu, ShieldCheck, X} from 'lucide-react';
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

const LOCALE_LABEL: Record<string, {short: string; long: string}> = {
  'zh-TW': {short: '🇹🇼 ZH', long: '🇹🇼 ZH-TW'},
  en: {short: '🇬🇧 EN', long: '🇬🇧 EN'},
  ja: {short: '🇯🇵 JA', long: '🇯🇵 日本語'}
};

type Session = {email: string; isAdmin: boolean} | null;

export function SiteHeader({session}: {session: Session}) {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <header className="matte sticky top-0 z-50 bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/80">
      {/* Desktop bar */}
      <div className="hidden md:flex h-[60px] items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2">
          <img
            src="/images/heyhey.jpg"
            alt="heyheydive"
            className="h-10 w-10 rounded-sm object-cover transition duration-300 group-hover:scale-105"
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
          <LocaleDropdown locale={locale} pathname={pathname} variant="desktop" />
          <SessionPill session={session} />
        </div>
      </div>

      {/* Mobile bar */}
      <div className="md:hidden flex h-14 items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2">
          <img
            src="/images/heyhey.jpg"
            alt="heyheydive"
            className="h-9 w-9 rounded-sm object-cover transition duration-300 group-hover:scale-105"
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
        <div className="flex items-center justify-center pb-5 font-en text-xs font-medium tracking-wide text-gray-300">
          <LocaleDropdown
            locale={locale}
            pathname={pathname}
            variant="mobile"
            onNavigate={() => setOpen(false)}
          />
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
        href="/member/login"
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

  // Signed in. Admin gets a quick link into the console; member to the portal.
  return (
    <Link
      href={session.isAdmin ? '/admin' : '/member'}
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

function LocaleDropdown({
  locale,
  pathname,
  variant,
  onNavigate
}: {
  locale: string;
  pathname: string;
  variant: 'desktop' | 'mobile';
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const label = variant === 'desktop'
    ? LOCALE_LABEL[locale]?.short ?? locale
    : LOCALE_LABEL[locale]?.long ?? locale;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 font-en font-medium tracking-wide text-white/90 transition hover:border-white/60 hover:bg-white/10',
          variant === 'desktop' ? 'text-[11px]' : 'text-xs'
        )}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform',
            open ? 'rotate-180' : ''
          )}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          className={cn(
            'absolute z-50 mt-2 min-w-[140px] overflow-hidden rounded-md border border-white/10 bg-navy-900 shadow-lg',
            variant === 'desktop' ? 'right-0' : 'left-1/2 -translate-x-1/2'
          )}
        >
          {routing.locales.map((l) => {
            const isActive = l === locale;
            return (
              <li key={l}>
                <Link
                  href={pathname}
                  locale={l}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className={cn(
                    'flex items-center justify-between gap-3 px-3.5 py-2 font-en text-xs text-white/90 transition hover:bg-white/10',
                    isActive && 'text-gold'
                  )}
                >
                  <span>{LOCALE_LABEL[l]?.long ?? l}</span>
                  {isActive ? <Check className="h-3.5 w-3.5" /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
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
