'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {createClient} from '@/lib/supabase/server';
import {requireAdminAction} from '@/lib/supabase/auth-actions';
import {uploadCover} from '@/lib/cms/storage';

const CATEGORIES = ['apparel', 'accessory', 'gear', 'print', 'other'] as const;
const STATUSES = ['active', 'sold_out', 'draft', 'archived'] as const;
const VARIANT_STATUSES = ['active', 'sold_out', 'archived'] as const;

type VariantInput = {
  id: string | null;
  size: string | null;
  color: string | null;
  sku: string | null;
  stock: number;
  price_twd: number | null;
  display_order: number;
  status: (typeof VARIANT_STATUSES)[number];
};

export type MerchFormState = {error: string | null};

export async function upsertMerchAction(
  _prev: MerchFormState,
  formData: FormData
): Promise<MerchFormState> {
  await requireAdminAction();

  const id = String(formData.get('id') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'zh-TW');
  const slug = String(formData.get('slug') ?? '').trim();

  if (!slug) return {error: 'Slug 為必填'};

  const file = formData.get('cover_image_file');
  let coverImage = nullable(formData.get('cover_image'));
  if (file instanceof File && file.size > 0) {
    const {url, error} = await uploadCover(file, `merch/${slug || 'product'}`);
    if (error) return {error: `封面上傳失敗：${error}`};
    if (url) coverImage = url;
  }

  // Gallery images: upload each non-empty file; concatenate with any existing URLs
  // user kept in the keep_gallery hidden inputs.
  const keptGallery = formData
    .getAll('keep_gallery')
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean);
  const newGalleryFiles = formData.getAll('gallery_files');
  const uploadedGallery: string[] = [];
  for (const f of newGalleryFiles) {
    if (f instanceof File && f.size > 0) {
      const {url, error} = await uploadCover(f, `merch/${slug}/gallery`);
      if (error) return {error: `相簿圖片上傳失敗：${error}`};
      if (url) uploadedGallery.push(url);
    }
  }
  const gallery = [...keptGallery, ...uploadedGallery];

  const variants = parseVariants(formData.get('variants_json'));
  if (variants.error) return {error: variants.error};

  // sizes[] / colors[] arrays are derived from the variants so the public
  // grid filters and product chip lists stay in sync without a second source
  // of truth. We keep the columns for query convenience.
  const derivedSizes = uniq(
    variants.rows.map((v) => v.size ?? '').filter(Boolean)
  );
  const derivedColors = uniq(
    variants.rows.map((v) => v.color ?? '').filter(Boolean)
  );
  const derivedStock = variants.rows.reduce(
    (sum, v) => (v.status === 'archived' ? sum : sum + v.stock),
    0
  );

  const payload = {
    slug,
    name: String(formData.get('name') ?? '').trim(),
    name_en: nullable(formData.get('name_en')),
    name_ja: nullable(formData.get('name_ja')),
    category: requireEnum(formData.get('category'), CATEGORIES, 'category'),
    price_twd: toInt(formData.get('price_twd'), 0),
    compare_at_price_twd: toIntOrNull(formData.get('compare_at_price_twd')),
    short_description: nullable(formData.get('short_description')),
    description: nullable(formData.get('description')),
    description_en: nullable(formData.get('description_en')),
    description_ja: nullable(formData.get('description_ja')),
    cover_image: coverImage,
    gallery,
    badge: nullable(formData.get('badge')),
    stock: variants.rows.length > 0 ? derivedStock : toIntOrNull(formData.get('stock')),
    sizes: derivedSizes,
    colors: derivedColors,
    features: lines(formData.get('features')),
    display_order: toInt(formData.get('display_order'), 0),
    status: requireEnum(formData.get('status'), STATUSES, 'status')
  };

  if (!payload.name) return {error: '商品名稱為必填'};
  if (payload.price_twd < 0) return {error: '價格不能為負數'};

  const supabase = await createClient();
  let productId = id;
  if (productId) {
    const {error} = await supabase
      .from('merch_products')
      .update(payload)
      .eq('id', productId);
    if (error) {
      if (error.code === '23505') {
        return {error: `Slug "${payload.slug}" 已被使用，請改用其他值。`};
      }
      return {error: error.message};
    }
  } else {
    const {data, error} = await supabase
      .from('merch_products')
      .insert(payload)
      .select('id')
      .single();
    if (error) {
      if (error.code === '23505') {
        return {error: `Slug "${payload.slug}" 已被使用，請改用其他值。`};
      }
      return {error: error.message};
    }
    productId = data.id;
  }

  const syncErr = await syncVariants(supabase, productId, variants.rows);
  if (syncErr) return {error: syncErr};

  revalidatePath(`/${locale}/admin/merch`);
  revalidatePath(`/${locale}/admin/merch/${productId}`);
  revalidatePath(`/${locale}/merch`);
  revalidatePath(`/${locale}/merch/${payload.slug}`);
  redirect(`/${locale}/admin/merch`);
}

async function syncVariants(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  rows: VariantInput[]
): Promise<string | null> {
  // Read existing variants and reconcile: delete the ones missing from the
  // submitted list, update the ones with an id, insert the new ones.
  const {data: existing, error: readErr} = await supabase
    .from('merch_variants')
    .select('id')
    .eq('product_id', productId);
  if (readErr) return readErr.message;

  const submittedIds = new Set(rows.map((r) => r.id).filter(Boolean) as string[]);
  const toDelete = (existing ?? [])
    .map((r) => r.id)
    .filter((id) => !submittedIds.has(id));
  if (toDelete.length > 0) {
    const {error} = await supabase
      .from('merch_variants')
      .delete()
      .in('id', toDelete);
    if (error) return `刪除舊規格失敗：${error.message}`;
  }

  for (const r of rows) {
    const payload = {
      product_id: productId,
      size: r.size,
      color: r.color,
      sku: r.sku,
      stock: r.stock,
      price_twd: r.price_twd,
      display_order: r.display_order,
      status: r.status
    };
    if (r.id) {
      const {error} = await supabase
        .from('merch_variants')
        .update(payload)
        .eq('id', r.id);
      if (error) return `更新規格失敗：${error.message}`;
    } else {
      const {error} = await supabase.from('merch_variants').insert(payload);
      if (error) {
        if (error.code === '23505') {
          return `規格重複：「${r.size ?? ''} / ${r.color ?? ''}」已存在`;
        }
        return `新增規格失敗：${error.message}`;
      }
    }
  }
  return null;
}

function parseVariants(
  raw: FormDataEntryValue | null
): {rows: VariantInput[]; error: string | null} {
  if (raw == null || typeof raw !== 'string' || raw.trim() === '') {
    return {rows: [], error: null};
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return {rows: [], error: '規格資料格式錯誤'};
  }
  if (!Array.isArray(json)) return {rows: [], error: '規格資料格式錯誤'};
  const rows: VariantInput[] = [];
  for (const item of json) {
    if (!item || typeof item !== 'object') continue;
    const v = item as Record<string, unknown>;
    const status = String(v.status ?? 'active');
    if (!(VARIANT_STATUSES as readonly string[]).includes(status)) continue;
    const stockN = Number(v.stock ?? 0);
    if (!Number.isFinite(stockN) || stockN < 0) {
      return {rows: [], error: '庫存必須為非負整數'};
    }
    const size = trimOrNull(v.size);
    const color = trimOrNull(v.color);
    rows.push({
      id: trimOrNull(v.id),
      size,
      color,
      sku: trimOrNull(v.sku),
      stock: Math.trunc(stockN),
      price_twd:
        v.price_twd === '' || v.price_twd == null
          ? null
          : Number.isFinite(Number(v.price_twd))
            ? Math.trunc(Number(v.price_twd))
            : null,
      display_order:
        Number.isFinite(Number(v.display_order)) ? Math.trunc(Number(v.display_order)) : 0,
      status: status as (typeof VARIANT_STATUSES)[number]
    });
  }
  // Reject duplicates so we get a clear error before hitting the DB constraint.
  const seen = new Set<string>();
  for (const r of rows) {
    const key = `${r.size ?? ''}|${r.color ?? ''}`;
    if (seen.has(key)) {
      return {
        rows: [],
        error: `規格重複：「${r.size ?? '（無）'} / ${r.color ?? '（無）'}」`
      };
    }
    seen.add(key);
  }
  return {rows, error: null};
}

function trimOrNull(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s : null;
}

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

export async function deleteMerchAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get('id') ?? '');
  const locale = String(formData.get('locale') ?? 'zh-TW');
  if (!id) return;
  const supabase = await createClient();
  await supabase.from('merch_products').delete().eq('id', id);
  revalidatePath(`/${locale}/admin/merch`);
  revalidatePath(`/${locale}/merch`);
  redirect(`/${locale}/admin/merch`);
}

function nullable(v: FormDataEntryValue | null): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  return s ? s : null;
}

function toInt(v: FormDataEntryValue | null, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toIntOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function csv(v: FormDataEntryValue | null): string[] {
  if (typeof v !== 'string') return [];
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function lines(v: FormDataEntryValue | null): string[] {
  if (typeof v !== 'string') return [];
  return v
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
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
