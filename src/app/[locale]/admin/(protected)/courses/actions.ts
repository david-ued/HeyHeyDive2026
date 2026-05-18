'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {createClient} from '@/lib/supabase/server';
import {requireAdminAction} from '@/lib/supabase/auth-actions';
import {uploadCover} from '@/lib/cms/storage';

const SYSTEMS = ['aida', 'padi', 'other'] as const;
const STATUSES = ['open', 'closed', 'draft'] as const;

export type CourseFormState = {error: string | null};

export async function upsertCourseAction(
  _prev: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'zh-TW');
  const slug = String(formData.get('slug') ?? '').trim();

  const file = formData.get('cover_image_file');
  let coverImageUrl = nullable(formData.get('cover_image'));
  if (file instanceof File && file.size > 0) {
    const {url, error} = await uploadCover(file, `courses/${slug || 'course'}`);
    if (error) return {error: `封面上傳失敗：${error}`};
    if (url) coverImageUrl = url;
  }

  const contentZh = parseJson(formData.get('content_zh'));
  if (contentZh === SENTINEL_INVALID) return {error: '中文深層內容不是合法 JSON'};
  const contentEn = parseJson(formData.get('content_en'));
  if (contentEn === SENTINEL_INVALID) return {error: 'English deep content is not valid JSON'};

  const payload = {
    slug,
    system: requireEnum(formData.get('system'), SYSTEMS, 'system'),
    level: String(formData.get('level') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim(),
    title_en: nullable(formData.get('title_en')),
    duration: nullable(formData.get('duration')),
    group_size: nullable(formData.get('group_size')),
    prerequisite: nullable(formData.get('prerequisite')),
    price_twd: toInt(formData.get('price_twd'), 0),
    description: nullable(formData.get('description')),
    description_en: nullable(formData.get('description_en')),
    cover_image: coverImageUrl,
    content_zh: contentZh,
    content_en: contentEn,
    status: requireEnum(formData.get('status'), STATUSES, 'status')
  };

  if (!payload.slug || !payload.title || !payload.level) {
    return {error: 'Slug、Level、標題為必填'};
  }

  const supabase = await createClient();
  const op = id
    ? supabase.from('courses').update(payload).eq('id', id)
    : supabase.from('courses').insert(payload);
  const {error} = await op;
  if (error) {
    if (error.code === '23505') return {error: `Slug "${payload.slug}" 已被使用。`};
    return {error: error.message};
  }
  revalidatePath(`/${locale}/admin/courses`);
  revalidatePath(`/${locale}/courses`);
  revalidatePath(`/${locale}/courses/${payload.slug}`);
  redirect(`/${locale}/admin/courses`);
}

export async function deleteCourseAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '');
  const locale = String(formData.get('locale') ?? 'zh-TW');
  if (!id) return;
  const supabase = await createClient();
  await supabase.from('courses').delete().eq('id', id);
  revalidatePath(`/${locale}/admin/courses`);
  revalidatePath(`/${locale}/courses`);
  redirect(`/${locale}/admin/courses`);
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
const SENTINEL_INVALID = Symbol('invalid-json');
function parseJson(v: FormDataEntryValue | null): unknown {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return SENTINEL_INVALID;
  }
}
