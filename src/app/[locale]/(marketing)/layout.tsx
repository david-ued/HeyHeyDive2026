import type {ReactNode} from 'react';
import {SiteHeader} from '@/components/marketing/site-header';
import {SiteFooter} from '@/components/marketing/site-footer';
import {getCurrentUser, isAdmin} from '@/lib/supabase/auth';

export default async function MarketingLayout({children}: {children: ReactNode}) {
  const user = await getCurrentUser();
  const session = user
    ? {email: user.email ?? '', isAdmin: isAdmin(user)}
    : null;
  return (
    <>
      <SiteHeader session={session} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
