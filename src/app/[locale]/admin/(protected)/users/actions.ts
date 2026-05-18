'use server';

import {revalidatePath} from 'next/cache';
import {createAdminClient} from '@/lib/supabase/admin-client';
import {requireAdminAction} from '@/lib/supabase/auth-actions';

export async function toggleAdminRoleAction(formData: FormData) {
  const me = await requireAdminAction();
  const userId = String(formData.get('user_id') ?? '');
  const makeAdmin = String(formData.get('make_admin') ?? '') === '1';
  if (!userId) return;

  if (userId === me.id && !makeAdmin) {
    // Refuse to demote yourself; otherwise an admin could lock themselves out.
    return;
  }

  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: {role: makeAdmin ? 'admin' : null}
  });
  revalidatePath('/zh-TW/admin/users');
  revalidatePath('/en/admin/users');
}

export async function deleteUserAction(formData: FormData) {
  const me = await requireAdminAction();
  const userId = String(formData.get('user_id') ?? '');
  if (!userId || userId === me.id) return;

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId);
  revalidatePath('/zh-TW/admin/users');
  revalidatePath('/en/admin/users');
}
