import {useTranslations} from 'next-intl';
import {redirect} from 'next/navigation';
import {getCurrentUser, isAdmin} from '@/lib/supabase/auth';
import {LoginForm} from './login-form';

export default async function AdminLoginPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const user = await getCurrentUser();
  if (isAdmin(user)) {
    redirect(`/${locale}/admin`);
  }
  return <LoginScreen locale={locale} />;
}

function LoginScreen({locale}: {locale: string}) {
  const t = useTranslations('Admin.login');
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-navy-900 px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src="/images/heyhey.jpg"
            alt="heyheydive"
            className="h-12 w-12 rounded-sm object-cover"
          />
          <p className="font-en text-[11px] font-bold tracking-[0.3em] text-gold">
            ADMIN CONSOLE
          </p>
          <h1 className="font-heading text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-sm text-gray-400">{t('subtitle')}</p>
        </div>
        <LoginForm locale={locale} />
      </div>
    </section>
  );
}
