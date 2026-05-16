import 'server-only';
import {redirect} from 'next/navigation';
import {getCurrentUser, isAdmin} from './auth';

/**
 * Use inside server actions to assert the caller is an admin.
 * Server actions cannot rely on the layout's guard, so each mutating
 * action calls this first.
 */
export async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    redirect('/zh-TW/admin/login');
  }
  return user!;
}
