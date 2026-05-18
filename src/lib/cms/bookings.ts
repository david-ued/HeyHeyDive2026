'use server';

import {revalidatePath} from 'next/cache';
import {createAdminClient} from '@/lib/supabase/admin-client';
import {createClient} from '@/lib/supabase/server';
import {requireAdminAction} from '@/lib/supabase/auth-actions';
import type {BookingItemType, BookingStatus} from './types';

export type BookingFormState = {
  ok: boolean;
  error: string | null;
};

const ITEM_TYPES: BookingItemType[] = ['trip', 'course'];
const STATUSES: BookingStatus[] = ['pending', 'contacted', 'confirmed', 'cancelled'];

/**
 * Public-facing booking submission. Uses the service-role client to bypass RLS
 * (the bookings table has no public insert policy).
 */
export async function createBookingAction(
  _prev: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const itemType = String(formData.get('item_type') ?? '');
  if (!(ITEM_TYPES as string[]).includes(itemType)) {
    return {ok: false, error: '無效的項目類型'};
  }

  const itemId = String(formData.get('item_id') ?? '').trim();
  const itemSlug = String(formData.get('item_slug') ?? '').trim();
  const itemTitleSnapshot = String(formData.get('item_title') ?? '').trim();
  const name = String(formData.get('contact_name') ?? '').trim();
  const email = String(formData.get('contact_email') ?? '').trim();
  const phone = nullable(formData.get('contact_phone'));
  const line = nullable(formData.get('contact_line'));
  const notes = nullable(formData.get('notes'));
  const partySize = Math.max(1, Math.min(99, Number(formData.get('party_size') ?? 1) || 1));

  if (!itemId || !itemSlug || !itemTitleSnapshot) {
    return {ok: false, error: '無法識別報名項目，請從詳情頁重新進入'};
  }
  if (!name) return {ok: false, error: '請填寫姓名'};
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return {ok: false, error: '請填寫合法的 Email'};
  }

  const admin = createAdminClient();
  const {error} = await admin.from('bookings').insert({
    item_type: itemType,
    item_id: itemId,
    item_slug: itemSlug,
    item_title_snapshot: itemTitleSnapshot,
    contact_name: name,
    contact_email: email,
    contact_phone: phone,
    contact_line: line,
    party_size: partySize,
    notes,
    status: 'pending'
  });

  if (error) {
    return {ok: false, error: `送出失敗：${error.message}`};
  }

  revalidatePath('/zh-TW/admin/bookings');
  revalidatePath('/en/admin/bookings');
  return {ok: true, error: null};
}

export type BookingUpdateState = {error: string | null};

/**
 * Admin-only status update. Uses the SSR client (cookie-auth) so RLS sees the
 * admin's session and allows the update.
 */
export async function updateBookingStatusAction(
  _prev: BookingUpdateState,
  formData: FormData
): Promise<BookingUpdateState> {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '').trim();
  const status = String(formData.get('status') ?? '');
  const adminNote = nullable(formData.get('admin_note'));
  const locale = String(formData.get('locale') ?? 'zh-TW');

  if (!id) return {error: '缺少 booking id'};
  if (!(STATUSES as string[]).includes(status)) {
    return {error: '無效的狀態值'};
  }

  const supabase = await createClient();
  const {error} = await supabase
    .from('bookings')
    .update({status, admin_note: adminNote})
    .eq('id', id);
  if (error) return {error: error.message};

  revalidatePath(`/${locale}/admin/bookings`);
  revalidatePath(`/${locale}/admin/bookings/${id}`);
  return {error: null};
}

function nullable(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return s || null;
}
