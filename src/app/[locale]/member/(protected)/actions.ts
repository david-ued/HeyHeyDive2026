'use server';

import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';

export async function signOutMemberAction(formData: FormData) {
  const locale = String(formData.get('locale') ?? 'zh-TW');
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/member/login`);
}
