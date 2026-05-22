import type {ReactNode} from 'react';
import {redirect} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {getCurrentUser, isAdmin} from '@/lib/supabase/auth';
import {Link} from '@/i18n/navigation';
import {signOutAction} from './actions';

const NAV = [
  {key: 'dashboard', href: '/admin'},
  {key: 'bookings', href: '/admin/bookings'},
  {key: 'trips', href: '/admin/trips'},
  {key: 'diveSites', href: '/admin/dive-sites'},
  {key: 'courses', href: '/admin/courses'},
  {key: 'merch', href: '/admin/merch'},
  {key: 'faqs', href: '/admin/faqs'},
  {key: 'users', href: '/admin/users'},
  {key: 'settings', href: '/admin/settings'}
] as const;

export default async function AdminProtectedLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    redirect(`/${locale}/admin/login`);
  }
  return <Shell locale={locale} email={user!.email ?? ''}>{children}</Shell>;
}

function Shell({
  children,
  locale,
  email
}: {
  children: ReactNode;
  locale: string;
  email: string;
}) {
  const t = useTranslations('Admin.shell');

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-off-white text-ink md:flex-row">
      {/* Sidebar */}
      <aside className="matte flex w-full shrink-0 flex-col gap-4 bg-navy-900 px-6 py-6 md:w-64 md:py-8">
        <div className="flex items-center gap-3">
          <img
            src="/images/heyhey.jpg"
            alt="heyheydive"
            className="h-9 w-9 rounded-sm object-cover"
          />
          <div className="flex flex-col leading-tight">
            <p className="font-en text-[10px] font-bold tracking-[0.2em] text-gold">
              ADMIN
            </p>
            <p className="text-sm text-white">{t('brand')}</p>
          </div>
        </div>

        <nav className="mt-2 flex flex-col gap-1">
          {NAV.map(({key, href}) => (
            <Link
              key={key}
              href={href}
              className="rounded-md px-3 py-2 text-sm text-gray-300 transition hover:bg-navy-800 hover:text-white"
            >
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-navy-700 pt-4">
          <div className="flex flex-col gap-1 text-xs text-gray-400">
            <span>{t('signedInAs')}</span>
            <span className="truncate font-en text-white">{email}</span>
          </div>
          <form action={signOutAction}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="w-full rounded-md border border-navy-700 px-3 py-2 text-left font-en text-sm text-gray-300 transition hover:bg-navy-800 hover:text-white"
            >
              {t('signOut')}
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="animate-fade-up flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
