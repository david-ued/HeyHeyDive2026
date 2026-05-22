import {Mail, ShieldCheck} from 'lucide-react';
import {getCurrentUser} from '@/lib/supabase/auth';
import {ChangePasswordForm} from './_components/change-password-form';
import {DisplayNameForm} from './_components/display-name-form';

export const dynamic = 'force-dynamic';

export default async function MemberAccountPage() {
  const user = await getCurrentUser();
  const displayName =
    (user?.user_metadata?.display_name as string | undefined)?.trim() ?? '';

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="font-en text-xs font-bold tracking-[0.2em] text-coral">ACCOUNT</p>
        <h1 className="font-heading text-3xl font-bold text-navy-900">帳號設定</h1>
        <p className="text-sm text-gray-600">
          管理你的登入資訊與顯示名稱。電話或緊急聯絡人若需修改，請聯絡工作人員。
        </p>
      </header>

      <section className="matte matte-soft overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-navy-900 to-navy-800 p-6 text-white">
        <h2 className="mb-3 font-en text-[11px] font-medium uppercase tracking-wider text-gold">
          Sign-in Identity
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gold" />
            <span className="font-en">{user?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span>建立時間：{user ? formatDate(user.created_at) : '—'}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <DisplayNameForm defaultValue={displayName} />
        <ChangePasswordForm />
      </div>

      <p className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-xs text-gray-500">
        忘記密碼或無法登入？請 LINE 工作人員（@heydive），我們可以重設你的密碼。
      </p>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}
