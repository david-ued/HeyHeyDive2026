'use server';

import {createClient} from '@/lib/supabase/server';

export type ChangePasswordState = {
  ok: boolean;
  error: string | null;
};

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const current = String(formData.get('current_password') ?? '');
  const next = String(formData.get('new_password') ?? '');
  const confirm = String(formData.get('confirm_password') ?? '');

  if (!current || !next || !confirm) {
    return {ok: false, error: '請填寫所有欄位'};
  }
  if (next.length < 8) {
    return {ok: false, error: '新密碼至少 8 個字元'};
  }
  if (next !== confirm) {
    return {ok: false, error: '新密碼與確認密碼不一致'};
  }
  if (next === current) {
    return {ok: false, error: '新密碼不可與目前密碼相同'};
  }

  const supabase = await createClient();
  const {data: userResp} = await supabase.auth.getUser();
  const user = userResp.user;
  if (!user || !user.email) {
    return {ok: false, error: '請重新登入'};
  }

  // Verify current password by attempting a sign-in. signInWithPassword on the
  // SSR client refreshes the session cookies, which is what we want anyway.
  const {error: verifyErr} = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current
  });
  if (verifyErr) {
    return {ok: false, error: '目前密碼不正確'};
  }

  const {error: updateErr} = await supabase.auth.updateUser({password: next});
  if (updateErr) {
    return {ok: false, error: `更新失敗：${updateErr.message}`};
  }

  return {ok: true, error: null};
}

export type ProfileState = {
  ok: boolean;
  error: string | null;
};

export async function updateDisplayNameAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const displayName = String(formData.get('display_name') ?? '').trim();
  if (!displayName) {
    return {ok: false, error: '請輸入顯示名稱'};
  }
  if (displayName.length > 80) {
    return {ok: false, error: '名稱過長（最多 80 字）'};
  }
  const supabase = await createClient();
  const {data: userResp} = await supabase.auth.getUser();
  if (!userResp.user) return {ok: false, error: '請重新登入'};

  const {error} = await supabase.auth.updateUser({
    data: {...(userResp.user.user_metadata ?? {}), display_name: displayName}
  });
  if (error) return {ok: false, error: error.message};
  return {ok: true, error: null};
}
