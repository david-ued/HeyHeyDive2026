'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {createClient} from '@/lib/supabase/server';
import {requireAdminAction} from '@/lib/supabase/auth-actions';
import {uploadCover} from '@/lib/cms/storage';
import {mergeContentFromFormData} from '@/lib/cms/content';

const DESTINATIONS = ['ludao', 'lanyu', 'liuqiu', 'kenting', 'other'] as const;
const KINDS = ['padi', 'aida', 'experience', 'other'] as const;
const STATUSES = ['open', 'sold_out', 'closed', 'draft'] as const;

export type TripFormState = {error: string | null};

export async function upsertTripAction(
  _prev: TripFormState,
  formData: FormData
): Promise<TripFormState> {
  await requireAdminAction();

  const id = String(formData.get('id') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'zh-TW');
  const slug = String(formData.get('slug') ?? '').trim();

  const supabase = await createClient();
  const existing = id
    ? (await supabase.from('trips').select('content_zh, content_en').eq('id', id).maybeSingle()).data
    : null;

  const file = formData.get('cover_image_file');
  let coverImageUrl = nullable(formData.get('cover_image'));
  if (file instanceof File && file.size > 0) {
    const {url, error} = await uploadCover(file, `trips/${slug || 'trip'}`);
    if (error) return {error: `封面上傳失敗：${error}`};
    if (url) coverImageUrl = url;
  }

  const contentZh = mergeContentFromFormData(formData, 'cz', existing?.content_zh ?? null);
  const contentEn = mergeContentFromFormData(formData, 'ce', existing?.content_en ?? null);

  const payload = {
    slug,
    title: String(formData.get('title') ?? '').trim(),
    title_en: nullable(formData.get('title_en')),
    destination: requireEnum(formData.get('destination'), DESTINATIONS, 'destination'),
    kind: requireEnum(formData.get('kind'), KINDS, 'kind'),
    start_date: String(formData.get('start_date') ?? ''),
    end_date: String(formData.get('end_date') ?? ''),
    price_twd: toInt(formData.get('price_twd'), 0),
    capacity: toInt(formData.get('capacity'), 10),
    available_seats: toInt(formData.get('available_seats'), 10),
    short_description: nullable(formData.get('short_description')),
    description: nullable(formData.get('description')),
    description_en: nullable(formData.get('description_en')),
    cover_image: coverImageUrl,
    content_zh: contentZh,
    content_en: contentEn,
    status: requireEnum(formData.get('status'), STATUSES, 'status')
  };

  if (!payload.slug || !payload.title) return {error: 'Slug 和標題為必填'};
  if (!payload.start_date || !payload.end_date) return {error: '請填寫開始與結束日期'};
  if (payload.end_date < payload.start_date) return {error: '結束日期不能早於開始日期'};

  const op = id
    ? supabase.from('trips').update(payload).eq('id', id)
    : supabase.from('trips').insert(payload);
  const {error} = await op;

  if (error) {
    if (error.code === '23505') {
      return {error: `Slug "${payload.slug}" 已被使用，請改用其他值。`};
    }
    return {error: error.message};
  }

  revalidatePath(`/${locale}/admin/trips`);
  revalidatePath(`/${locale}/calendar`);
  revalidatePath(`/${locale}/trips/${payload.slug}`);
  redirect(`/${locale}/admin/trips`);
}

export async function deleteTripAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '');
  const locale = String(formData.get('locale') ?? 'zh-TW');
  if (!id) return;
  const supabase = await createClient();
  await supabase.from('trips').delete().eq('id', id);
  revalidatePath(`/${locale}/admin/trips`);
  revalidatePath(`/${locale}/calendar`);
  redirect(`/${locale}/admin/trips`);
}

function nullable(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return s ? s : null;
}

function toInt(v: FormDataEntryValue | null, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function requireEnum<T extends readonly string[]>(
  v: FormDataEntryValue | null,
  allowed: T,
  field: string
): T[number] {
  const s = String(v ?? '');
  if (!(allowed as readonly string[]).includes(s)) {
    throw new Error(`Invalid ${field}: ${s}`);
  }
  return s as T[number];
}
