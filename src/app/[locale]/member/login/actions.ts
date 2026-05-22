'use server';

import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';

export type MemberLoginState = {error: string | null};

export async function signInMemberAction(
  _prev: MemberLoginState,
  formData: FormData
): Promise<MemberLoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const locale = String(formData.get('locale') ?? 'zh-TW');

  if (!email || !password) {
    return {error: 'missing-fields'};
  }

  const supabase = await createClient();
  const {data, error} = await supabase.auth.signInWithPassword({email, password});

  if (error || !data.user) {
    return {error: 'invalid-credentials'};
  }

  // Admins are also valid members — they go to the admin console.
  if (data.user.app_metadata?.role === 'admin') {
    redirect(`/${locale}/admin`);
  }

  redirect(`/${locale}/member`);
}
