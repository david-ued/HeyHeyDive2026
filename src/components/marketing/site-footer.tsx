import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {InstagramIcon, FacebookIcon, LineIcon} from './brand-icons';

const QUICK_LINKS = [
  {key: 'about', href: '/about'},
  {key: 'courses', href: '/courses'},
  {key: 'sites', href: '/dive-sites'},
  {key: 'faq', href: '/faq'},
  {key: 'calendar', href: '/calendar'}
] as const;

export function SiteFooter() {
  const t = useTranslations('Footer');
  const tNav = useTranslations('Nav');

  return (
    <footer className="bg-navy-900 text-white">
      {/* Desktop */}
      <div className="hidden md:block mx-auto max-w-[1440px] px-16 py-12">
        <div className="flex gap-8 items-start">
          <div className="flex flex-1 flex-col gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-sm border border-white font-en text-[10px] font-bold tracking-[0.1em]">
              HH
            </span>
            <p className="font-en text-lg font-semibold">heyheydive</p>
            <p className="text-sm leading-[1.6] text-gray-300">
              {t('description')}
            </p>
          </div>

          <FooterCol title={t('quickLinks')} className="w-[180px]">
            {QUICK_LINKS.map(({key, href}) => (
              <Link
                key={key}
                href={href}
                className="text-sm text-gray-300 transition hover:text-gold"
              >
                {tNav(key)}
              </Link>
            ))}
          </FooterCol>

          <FooterCol title={t('social')} className="w-[180px]">
            <div className="flex gap-3">
              <SocialIconLink href="https://line.me" label="LINE">
                <LineIcon className="h-5 w-5" />
              </SocialIconLink>
              <SocialIconLink
                href="https://www.instagram.com/heyheydive"
                label="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </SocialIconLink>
              <SocialIconLink href="https://www.facebook.com" label="Facebook">
                <FacebookIcon className="h-5 w-5" />
              </SocialIconLink>
            </div>
          </FooterCol>

          <FooterCol title={t('contact')} className="w-[220px]">
            <a
              href="mailto:hello@heyheydive.com"
              className="font-en text-sm text-gray-300 transition hover:text-gold"
            >
              hello@heyheydive.com
            </a>
            <a
              href="tel:+886989123456"
              className="font-en text-sm text-gray-300 transition hover:text-gold"
            >
              +886 989 123 456
            </a>
            <p className="text-sm leading-[1.5] text-gray-300">{t('address')}</p>
          </FooterCol>
        </div>

        <div className="my-10 h-px bg-navy-700" />

        <div className="flex items-center justify-between">
          <p className="font-en text-xs text-gray-400">{t('copyright')}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gold">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gold">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-8 px-6 py-8">
        <div className="flex flex-col gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-sm border border-white font-en text-[10px] font-bold tracking-[0.1em]">
            HH
          </span>
          <p className="font-en text-base font-semibold">heyheydive</p>
          <p className="text-sm leading-[1.6] text-gray-300">
            {t('description')}
          </p>
        </div>

        <hr className="border-navy-700" />

        <FooterCol title={t('quickLinks')}>
          {QUICK_LINKS.map(({key, href}) => (
            <Link
              key={key}
              href={href}
              className="text-sm text-gray-300 hover:text-gold"
            >
              {tNav(key)}
            </Link>
          ))}
        </FooterCol>

        <hr className="border-navy-700" />

        <FooterCol title={t('social')}>
          <div className="flex gap-4 text-gray-300">
            <SocialIconLink href="https://www.instagram.com/heyheydive" label="Instagram">
              <InstagramIcon className="h-[22px] w-[22px]" />
            </SocialIconLink>
            <SocialIconLink href="https://www.facebook.com" label="Facebook">
              <FacebookIcon className="h-[22px] w-[22px]" />
            </SocialIconLink>
            <SocialIconLink href="https://line.me" label="LINE">
              <LineIcon className="h-[22px] w-[22px]" />
            </SocialIconLink>
          </div>
        </FooterCol>

        <hr className="border-navy-700" />

        <FooterCol title={t('contact')}>
          <a
            href="mailto:hello@heyheydive.com"
            className="font-en text-sm text-gray-300"
          >
            hello@heyheydive.com
          </a>
          <a href="tel:+886989123456" className="font-en text-sm text-gray-300">
            +886 989 123 456
          </a>
          <p className="text-sm text-gray-300">{t('address')}</p>
        </FooterCol>

        <hr className="border-navy-700" />

        <div className="flex flex-col gap-2">
          <p className="font-en text-xs text-gray-400">{t('copyright')}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-gray-400">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="text-xs text-gray-400">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
  className
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className ?? ''}`}>
      <p className="text-sm font-semibold text-white">{title}</p>
      {children}
    </div>
  );
}

function SocialIconLink({
  href,
  label,
  children
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="text-gray-300 transition hover:text-gold"
    >
      {children}
    </a>
  );
}
