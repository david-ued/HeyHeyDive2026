import Link from 'next/link';
import {createAdminClient} from '@/lib/supabase/admin-client';
import {getCurrentUser} from '@/lib/supabase/auth';
import {toggleAdminRoleAction} from './actions';
import {DeleteUserButton} from './_components/delete-user-button';

export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  lastSignInAt: string | null;
};

async function listUsers(): Promise<
  {status: 'ok'; rows: Row[]} | {status: 'error'; error: string}
> {
  try {
    const admin = createAdminClient();
    const {data, error} = await admin.auth.admin.listUsers({page: 1, perPage: 200});
    if (error) return {status: 'error', error: error.message};
    const rows: Row[] = data.users.map((u) => ({
      id: u.id,
      email: u.email ?? '(no email)',
      isAdmin: u.app_metadata?.role === 'admin',
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null
    }));
    rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return {status: 'ok', rows};
  } catch (e) {
    return {
      status: 'error',
      error: e instanceof Error ? e.message : 'Failed to load users'
    };
  }
}

export default async function AdminUsersPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const [result, me] = await Promise.all([listUsers(), getCurrentUser()]);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-en text-xs font-bold tracking-[0.2em] text-coral">USERS</p>
        <h1 className="font-heading text-2xl font-bold text-navy-900">會員管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          顯示 Supabase Auth 的所有使用者。可切換管理員權限或移除帳號。
        </p>
      </header>

      {result.status === 'error' ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {result.error}
        </p>
      ) : result.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          目前沒有任何會員。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">權限</th>
                <th className="px-4 py-3">註冊日期</th>
                <th className="px-4 py-3">最後登入</th>
                <th className="px-4 py-3 text-right">動作</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((u) => {
                const isMe = me?.id === u.id;
                return (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-en text-navy-900">
                      {u.email}
                      {isMe ? (
                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                          你
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          管理員
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          一般會員
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-en text-xs text-gray-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-en text-xs text-gray-500">
                      {u.lastSignInAt ? formatDate(u.lastSignInAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/admin/users/${u.id}`}
                          className="rounded-md border border-coral/40 px-3 py-1.5 text-xs font-medium text-coral hover:bg-coral/10"
                        >
                          詳細 / 證照
                        </Link>
                        {isMe ? null : (
                          <form action={toggleAdminRoleAction}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <input
                              type="hidden"
                              name="make_admin"
                              value={u.isAdmin ? '0' : '1'}
                            />
                            <button
                              type="submit"
                              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                            >
                              {u.isAdmin ? '取消管理員' : '設為管理員'}
                            </button>
                          </form>
                        )}
                        {isMe ? null : <DeleteUserButton id={u.id} email={u.email} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}
