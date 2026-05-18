import 'server-only';
import {createAdminClient} from '@/lib/supabase/admin-client';

const BUCKET = 'covers';

/**
 * Upload a cover image to Supabase Storage and return its public URL.
 * Uses the service-role client (bypasses RLS) — call only from server actions
 * that have already verified the caller is an admin.
 */
export async function uploadCover(
  file: File,
  pathPrefix: string
): Promise<{url: string | null; error: string | null}> {
  if (!file || file.size === 0) return {url: null, error: null};
  if (!file.type.startsWith('image/')) {
    return {url: null, error: '只支援圖片檔'};
  }
  if (file.size > 5 * 1024 * 1024) {
    return {url: null, error: '圖片大小不可超過 5MB'};
  }

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safePrefix = pathPrefix.replace(/[^a-zA-Z0-9-_]/g, '') || 'cover';
  const path = `${safePrefix}/${Date.now()}.${ext || 'jpg'}`;

  const admin = createAdminClient();
  const buf = Buffer.from(await file.arrayBuffer());
  const {error} = await admin.storage
    .from(BUCKET)
    .upload(path, buf, {contentType: file.type, upsert: false});
  if (error) return {url: null, error: error.message};

  const {data} = admin.storage.from(BUCKET).getPublicUrl(path);
  return {url: data.publicUrl, error: null};
}
