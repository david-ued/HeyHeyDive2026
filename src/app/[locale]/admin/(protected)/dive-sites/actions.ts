'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {createClient} from '@/lib/supabase/server';
import {requireAdminAction} from '@/lib/supabase/auth-actions';

const STATUSES = ['open', 'closed', 'draft'] as const;

export type DiveSiteFormState = {error: string | null};

export async function upsertDiveSiteAction(
  _prev: DiveSiteFormState,
  formData: FormData
): Promise<DiveSiteFormState> {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'zh-TW');

  const payload = {
    slug: String(formData.get('slug') ?? '').trim(),
    name: String(formData.get('name') ?? '').trim(),
    name_en: nullable(formData.get('name_en')),
    region: nullable(formData.get('region')),
    temp: nullable(formData.get('temp')),
    visibility: nullable(formData.get('visibility')),
    intro: nullable(formData.get('intro')),
    intro_en: nullable(formData.get('intro_en')),
    cover_image: nullable(formData.get('cover_image')),
    display_order: toInt(formData.get('display_order'), 0),
    status: requireEnum(formData.get('status'), STATUSES, 'status')
  };

  if (!payload.slug || !payload.name) {
    return {error: 'Slug 與名稱為必填'};
  }

  const supabase = await createClient();
  const op = id
    ? supabase.from('dive_sites').update(payload).eq('id', id)
    : supabase.from('dive_sites').insert(payload);
  const {error} = await op;
  if (error) {
    if (error.code === '23505') return {error: `Slug "${payload.slug}" 已被使用。`};
    return {error: error.message};
  }
  revalidatePath(`/${locale}/admin/dive-sites`);
  revalidatePath(`/${locale}/dive-sites`);
  redirect(`/${locale}/admin/dive-sites`);
}

export async function deleteDiveSiteAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '');
  const locale = String(formData.get('locale') ?? 'zh-TW');
  if (!id) return;
  const supabase = await createClient();
  await supabase.from('dive_sites').delete().eq('id', id);
  revalidatePath(`/${locale}/admin/dive-sites`);
  revalidatePath(`/${locale}/dive-sites`);
  redirect(`/${locale}/admin/dive-sites`);
}

function nullable(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return s || null;
}
function toInt(v: FormDataEntryValue | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
function requireEnum<T extends readonly string[]>(v: FormDataEntryValue | null, allowed: T, field: string): T[number] {
  const s = String(v ?? '');
  if (!(allowed as readonly string[]).includes(s)) throw new Error(`Invalid ${field}: ${s}`);
  return s as T[number];
}
