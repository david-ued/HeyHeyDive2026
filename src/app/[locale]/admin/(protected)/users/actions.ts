'use server';

import {randomBytes} from 'node:crypto';
import {revalidatePath} from 'next/cache';
import {createAdminClient} from '@/lib/supabase/admin-client';
import {requireAdminAction} from '@/lib/supabase/auth-actions';

export type ResetPasswordState = {
  password: string | null;
  error: string | null;
};

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

export async function resetMemberPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  await requireAdminAction();
  const userId = String(formData.get('user_id') ?? '').trim();
  if (!userId) return {password: null, error: '缺少使用者 ID'};

  const password = generatePassword();
  const admin = createAdminClient();
  const {error} = await admin.auth.admin.updateUserById(userId, {password});
  if (error) return {password: null, error: error.message};

  revalidatePath(`/zh-TW/admin/users/${userId}`);
  revalidatePath(`/en/admin/users/${userId}`);
  return {password, error: null};
}

function generatePassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(14);
  let out = '';
  for (let i = 0; i < 14; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
