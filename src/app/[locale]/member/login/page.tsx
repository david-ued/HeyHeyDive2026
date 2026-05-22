import {redirect} from 'next/navigation';
import {getCurrentUser, isAdmin} from '@/lib/supabase/auth';
import {MemberLoginForm} from './login-form';

export const dynamic = 'force-dynamic';

export default async function MemberLoginPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const user = await getCurrentUser();
  if (user) {
    redirect(isAdmin(user) ? `/${locale}/admin` : `/${locale}/member`);
  }

  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-gradient-to-b from-off-white to-white px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src="/images/heyhey.jpg"
            alt="heyheydive"
            className="h-14 w-14 rounded-md object-cover"
          />
          <p className="font-en text-[11px] font-bold tracking-[0.3em] text-coral">
            MEMBER PORTAL
          </p>
          <h1 className="font-heading text-2xl font-bold text-navy-900">會員登入</h1>
          <p className="text-sm text-gray-600">
            報名確認後，工作人員會提供你的登入帳密。
          </p>
        </div>
        <MemberLoginForm locale={locale} />
      </div>
    </section>
  );
}
