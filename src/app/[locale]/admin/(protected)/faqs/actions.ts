'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {createClient} from '@/lib/supabase/server';
import {requireAdminAction} from '@/lib/supabase/auth-actions';

const STATUSES = ['open', 'draft'] as const;

export type FaqFormState = {error: string | null};

// ─── Categories ──────────────────────────────────────────────────────

export async function upsertFaqCategoryAction(
  _prev: FaqFormState,
  formData: FormData
): Promise<FaqFormState> {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'zh-TW');

  const payload = {
    slug: String(formData.get('slug') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim(),
    title_en: nullable(formData.get('title_en')),
    title_ja: nullable(formData.get('title_ja')),
    kicker: nullable(formData.get('kicker')),
    display_order: toInt(formData.get('display_order'), 0),
    status: requireEnum(formData.get('status'), STATUSES, 'status')
  };

  if (!payload.slug || !payload.title) {
    return {error: 'Slug、中文標題為必填'};
  }

  const supabase = await createClient();
  const op = id
    ? supabase.from('faq_categories').update(payload).eq('id', id)
    : supabase.from('faq_categories').insert(payload);
  const {error} = await op;
  if (error) {
    if (error.code === '23505') return {error: `Slug "${payload.slug}" 已被使用。`};
    return {error: error.message};
  }
  revalidatePath(`/${locale}/admin/faqs`);
  revalidatePath(`/${locale}/faq`);
  redirect(`/${locale}/admin/faqs`);
}

export async function deleteFaqCategoryAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '');
  const locale = String(formData.get('locale') ?? 'zh-TW');
  if (!id) return;
  const supabase = await createClient();
  await supabase.from('faq_categories').delete().eq('id', id);
  revalidatePath(`/${locale}/admin/faqs`);
  revalidatePath(`/${locale}/faq`);
  redirect(`/${locale}/admin/faqs`);
}

// ─── Items ───────────────────────────────────────────────────────────

export async function upsertFaqItemAction(
  _prev: FaqFormState,
  formData: FormData
): Promise<FaqFormState> {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'zh-TW');

  const payload = {
    category_id: String(formData.get('category_id') ?? '').trim(),
    question: String(formData.get('question') ?? '').trim(),
    question_en: nullable(formData.get('question_en')),
    question_ja: nullable(formData.get('question_ja')),
    answer: String(formData.get('answer') ?? '').trim(),
    answer_en: nullable(formData.get('answer_en')),
    answer_ja: nullable(formData.get('answer_ja')),
    display_order: toInt(formData.get('display_order'), 0),
    status: requireEnum(formData.get('status'), STATUSES, 'status')
  };

  if (!payload.category_id) return {error: '請選擇分類'};
  if (!payload.question || !payload.answer) {
    return {error: '中文問題與答覆為必填'};
  }

  const supabase = await createClient();
  const op = id
    ? supabase.from('faq_items').update(payload).eq('id', id)
    : supabase.from('faq_items').insert(payload);
  const {error} = await op;
  if (error) return {error: error.message};

  revalidatePath(`/${locale}/admin/faqs`);
  revalidatePath(`/${locale}/faq`);
  redirect(`/${locale}/admin/faqs`);
}

export async function deleteFaqItemAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '');
  const locale = String(formData.get('locale') ?? 'zh-TW');
  if (!id) return;
  const supabase = await createClient();
  await supabase.from('faq_items').delete().eq('id', id);
  revalidatePath(`/${locale}/admin/faqs`);
  revalidatePath(`/${locale}/faq`);
  redirect(`/${locale}/admin/faqs`);
}

function nullable(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return s || null;
}
function toInt(v: FormDataEntryValue | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
function requireEnum<T extends readonly string[]>(
  v: FormDataEntryValue | null,
  allowed: T,
  field: string
): T[number] {
  const s = String(v ?? '');
  if (!(allowed as readonly string[]).includes(s)) throw new Error(`Invalid ${field}: ${s}`);
  return s as T[number];
}
