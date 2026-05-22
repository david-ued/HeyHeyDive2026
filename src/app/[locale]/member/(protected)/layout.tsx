import type {ReactNode} from 'react';
import {redirect} from 'next/navigation';
import {getCurrentUser} from '@/lib/supabase/auth';
import {MemberShell} from './_components/member-shell';

export default async function MemberProtectedLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/member/login`);
  }
  const displayName =
    (user!.user_metadata?.display_name as string | undefined)?.trim() ||
    user!.email ||
    '會員';

  return (
    <MemberShell
      locale={locale}
      email={user!.email ?? ''}
      displayName={displayName}
    >
      {children}
    </MemberShell>
  );
}
