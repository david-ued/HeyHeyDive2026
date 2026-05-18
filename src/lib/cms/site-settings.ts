import 'server-only';
import {createClient} from '@/lib/supabase/server';
import type {SiteSettings} from './types';

const EMPTY: SiteSettings = {
  id: 'default',
  meta_title: null,
  meta_title_en: null,
  meta_description: null,
  meta_description_en: null,
  favicon_url: null,
  og_image_url: null,
  updated_at: ''
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();
  if (error || !data) return EMPTY;
  return data as SiteSettings;
}
