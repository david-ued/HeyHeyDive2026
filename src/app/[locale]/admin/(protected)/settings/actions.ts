'use server';

import {revalidatePath} from 'next/cache';
import {createClient} from '@/lib/supabase/server';
import {requireAdminAction} from '@/lib/supabase/auth-actions';

export type SettingsFormState = {error: string | null; success: boolean};

export async function saveSiteSettingsAction(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdminAction();

  const payload = {
    id: 'default' as const,
    meta_title: nullable(formData.get('meta_title')),
    meta_title_en: nullable(formData.get('meta_title_en')),
    meta_description: nullable(formData.get('meta_description')),
    meta_description_en: nullable(formData.get('meta_description_en')),
    favicon_url: nullable(formData.get('favicon_url')),
    og_image_url: nullable(formData.get('og_image_url'))
  };

  const supabase = await createClient();
  const {error} = await supabase
    .from('site_settings')
    .upsert(payload, {onConflict: 'id'});
  if (error) {
    if (error.code === '42P01') {
      return {
        error: 'site_settings 資料表尚未建立，請先執行 0003_site_settings.sql',
        success: false
      };
    }
    return {error: error.message, success: false};
  }

  revalidatePath('/', 'layout');
  return {error: null, success: true};
}

function nullable(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return s || null;
}
