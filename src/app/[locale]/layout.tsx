import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Geist_Mono, Inter, Noto_Sans_TC} from 'next/font/google';
import {routing} from '@/i18n/routing';
import {getSiteSettings} from '@/lib/cms/site-settings';
import '../globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

const notoSansTC = Noto_Sans_TC({
  variable: '--font-noto-sans-tc',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900']
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Meta'});
  const settings = await getSiteSettings();

  const isEn = locale === 'en';
  const title = (isEn ? settings.meta_title_en : settings.meta_title) ?? t('title');
  const description =
    (isEn ? settings.meta_description_en : settings.meta_description) ?? t('description');
  const favicon = settings.favicon_url;
  const ogImage = settings.og_image_url;

  return {
    title,
    description,
    icons: favicon ? {icon: favicon, shortcut: favicon, apple: favicon} : undefined,
    openGraph: {
      title,
      description,
      images: ogImage ? [{url: ogImage}] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${geistMono.variable} ${notoSansTC.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-tc-webfont@1.7.0/style.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-navy-900 text-white">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
