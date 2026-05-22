'use server';

import {revalidatePath} from 'next/cache';
import {createAdminClient} from '@/lib/supabase/admin-client';
import {createClient} from '@/lib/supabase/server';
import {requireAdminAction} from '@/lib/supabase/auth-actions';
import {getCurrentUser} from '@/lib/supabase/auth';
import type {Certificate, CertificateSystem} from './types';

const BUCKET = 'certificates';
const SYSTEMS: CertificateSystem[] = ['aida', 'padi', 'other'];

export type CertificateFormState = {
  ok: boolean;
  error: string | null;
};

export async function listCertificatesForUser(userId: string): Promise<Certificate[]> {
  const admin = createAdminClient();
  const {data, error} = await admin
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: false});
  if (error || !data) return [];
  return data as Certificate[];
}

export async function listMyCertificates(): Promise<Certificate[]> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('certificates')
    .select('*')
    .order('created_at', {ascending: false});
  if (error || !data) return [];
  return data as Certificate[];
}

export async function createCertificateAction(
  _prev: CertificateFormState,
  formData: FormData
): Promise<CertificateFormState> {
  await requireAdminAction();

  const userId = String(formData.get('user_id') ?? '').trim();
  const system = String(formData.get('system') ?? '').trim();
  const level = String(formData.get('level') ?? '').trim();
  const certNumber = optional(formData.get('cert_number'));
  const issuedDate = optional(formData.get('issued_date'));
  const notes = optional(formData.get('notes'));
  const image = formData.get('image');
  const locale = String(formData.get('locale') ?? 'zh-TW');

  if (!userId) return {ok: false, error: '缺少會員 ID'};
  if (!(SYSTEMS as string[]).includes(system)) {
    return {ok: false, error: '請選擇正確的系統 (AIDA / PADI / Other)'};
  }
  if (!level) return {ok: false, error: '請輸入等級 (e.g. OWD, AIDA 2)'};

  const admin = createAdminClient();

  let imagePath: string | null = null;
  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith('image/')) {
      return {ok: false, error: '只支援圖片檔'};
    }
    if (image.size > 5 * 1024 * 1024) {
      return {ok: false, error: '圖片大小不可超過 5MB'};
    }
    const ext = (image.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    imagePath = `${userId}/${Date.now()}.${ext || 'jpg'}`;
    const buf = Buffer.from(await image.arrayBuffer());
    const {error: upErr} = await admin.storage
      .from(BUCKET)
      .upload(imagePath, buf, {contentType: image.type, upsert: false});
    if (upErr) return {ok: false, error: `圖片上傳失敗：${upErr.message}`};
  }

  const {error} = await admin.from('certificates').insert({
    user_id: userId,
    system,
    level,
    cert_number: certNumber,
    issued_date: issuedDate,
    image_path: imagePath,
    notes
  });

  if (error) {
    if (imagePath) {
      await admin.storage.from(BUCKET).remove([imagePath]).catch(() => null);
    }
    return {ok: false, error: error.message};
  }

  revalidatePath(`/${locale}/admin/users/${userId}`);
  revalidatePath(`/${locale}/member/certificates`);
  return {ok: true, error: null};
}

export async function deleteCertificateAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'zh-TW');
  if (!id) return;

  const admin = createAdminClient();
  const {data: cert} = await admin
    .from('certificates')
    .select('user_id, image_path')
    .eq('id', id)
    .maybeSingle();

  await admin.from('certificates').delete().eq('id', id);
  if (cert?.image_path) {
    await admin.storage.from(BUCKET).remove([cert.image_path]).catch(() => null);
  }

  if (cert?.user_id) {
    revalidatePath(`/${locale}/admin/users/${cert.user_id}`);
  }
  revalidatePath(`/${locale}/member/certificates`);
}

/**
 * Generate a short-lived signed URL for a certificate image. We re-check
 * ownership server-side: admins can view any, members can only view their own.
 */
export async function getCertificateImageUrl(
  certId: string
): Promise<{url: string | null; error: string | null}> {
  const user = await getCurrentUser();
  if (!user) return {url: null, error: 'unauthenticated'};

  const admin = createAdminClient();
  const {data: cert, error} = await admin
    .from('certificates')
    .select('user_id, image_path')
    .eq('id', certId)
    .maybeSingle();
  if (error || !cert) return {url: null, error: 'not-found'};
  if (!cert.image_path) return {url: null, error: 'no-image'};

  const isAdmin = user.app_metadata?.role === 'admin';
  if (!isAdmin && cert.user_id !== user.id) {
    return {url: null, error: 'forbidden'};
  }

  const {data, error: signErr} = await admin.storage
    .from(BUCKET)
    .createSignedUrl(cert.image_path, 60 * 10);
  if (signErr || !data?.signedUrl) {
    return {url: null, error: signErr?.message ?? 'sign-failed'};
  }
  return {url: data.signedUrl, error: null};
}

function optional(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return s || null;
}
