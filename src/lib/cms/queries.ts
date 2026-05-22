import 'server-only';
import {createClient} from '@/lib/supabase/server';
import type {
  Booking,
  BookingStatus,
  Course,
  DiveSite,
  FaqCategory,
  FaqCategoryWithItems,
  FaqItem,
  MerchProduct,
  MerchProductWithVariants,
  MerchVariant,
  Trip
} from './types';

/**
 * `relation "public.X" does not exist` errors from PostgREST surface as a
 * specific code (`42P01` / PGRST204). We treat that as "migration not yet
 * applied" — return an empty list rather than 500 the page, so the CMS UI
 * can show a friendly prompt.
 */
function isMissingTable(err: {message?: string; code?: string} | null): boolean {
  if (!err) return false;
  return (
    err.code === '42P01' ||
    err.code === 'PGRST204' ||
    (err.message ?? '').toLowerCase().includes('does not exist') ||
    (err.message ?? '').toLowerCase().includes('schema cache')
  );
}

export type TableState<T> =
  | {status: 'ok'; rows: T[]}
  | {status: 'missing-table'; rows: []}
  | {status: 'error'; rows: []; error: string};

async function fetchAll<T>(
  table: 'trips' | 'dive_sites' | 'courses',
  order: {column: string; ascending: boolean}
): Promise<TableState<T>> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from(table)
    .select('*')
    .order(order.column, {ascending: order.ascending});
  if (error) {
    if (isMissingTable(error)) return {status: 'missing-table', rows: []};
    return {status: 'error', rows: [], error: error.message};
  }
  return {status: 'ok', rows: (data ?? []) as T[]};
}

export async function listTrips(): Promise<TableState<Trip>> {
  return fetchAll<Trip>('trips', {column: 'start_date', ascending: true});
}

export async function listPublicTrips(): Promise<Trip[]> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('trips')
    .select('*')
    .neq('status', 'draft')
    .order('start_date', {ascending: true});
  if (error) return [];
  return (data ?? []) as Trip[];
}

export async function getTripBySlug(slug: string): Promise<Trip | null> {
  const supabase = await createClient();
  const {data} = await supabase.from('trips').select('*').eq('slug', slug).maybeSingle();
  return (data ?? null) as Trip | null;
}

export async function listTripsInRange(
  startISO: string,
  endISO: string
): Promise<TableState<Trip>> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('trips')
    .select('*')
    .neq('status', 'draft')
    .lte('start_date', endISO)
    .gte('end_date', startISO)
    .order('start_date', {ascending: true});
  if (error) {
    if (isMissingTable(error)) return {status: 'missing-table', rows: []};
    return {status: 'error', rows: [], error: error.message};
  }
  return {status: 'ok', rows: (data ?? []) as Trip[]};
}

export async function getTrip(id: string): Promise<Trip | null> {
  const supabase = await createClient();
  const {data, error} = await supabase.from('trips').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data as Trip;
}

export async function listDiveSites(): Promise<TableState<DiveSite>> {
  return fetchAll<DiveSite>('dive_sites', {column: 'display_order', ascending: true});
}

export async function listPublicDiveSites(): Promise<DiveSite[]> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('dive_sites')
    .select('*')
    .neq('status', 'draft')
    .order('display_order', {ascending: true});
  if (error) return [];
  return (data ?? []) as DiveSite[];
}

export async function getDiveSite(id: string): Promise<DiveSite | null> {
  const supabase = await createClient();
  const {data} = await supabase.from('dive_sites').select('*').eq('id', id).maybeSingle();
  return (data ?? null) as DiveSite | null;
}

export async function getDiveSiteBySlug(slug: string): Promise<DiveSite | null> {
  const supabase = await createClient();
  const {data} = await supabase.from('dive_sites').select('*').eq('slug', slug).maybeSingle();
  return (data ?? null) as DiveSite | null;
}

export async function listCourses(): Promise<TableState<Course>> {
  return fetchAll<Course>('courses', {column: 'created_at', ascending: false});
}

export async function listPublicCourses(): Promise<Course[]> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('courses')
    .select('*')
    .neq('status', 'draft')
    .order('created_at', {ascending: true});
  if (error) return [];
  return (data ?? []) as Course[];
}

export async function getCourse(id: string): Promise<Course | null> {
  const supabase = await createClient();
  const {data} = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
  return (data ?? null) as Course | null;
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const supabase = await createClient();
  const {data} = await supabase.from('courses').select('*').eq('slug', slug).maybeSingle();
  return (data ?? null) as Course | null;
}

export async function listMerchProducts(): Promise<TableState<MerchProduct>> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('merch_products')
    .select('*')
    .order('display_order', {ascending: true})
    .order('created_at', {ascending: false});
  if (error) {
    if (isMissingTable(error)) return {status: 'missing-table', rows: []};
    return {status: 'error', rows: [], error: error.message};
  }
  return {status: 'ok', rows: (data ?? []) as MerchProduct[]};
}

export async function listPublicMerchProducts(): Promise<MerchProduct[]> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('merch_products')
    .select('*')
    .in('status', ['active', 'sold_out'])
    .order('display_order', {ascending: true})
    .order('created_at', {ascending: false});
  if (error) return [];
  return (data ?? []) as MerchProduct[];
}

export async function getMerchProduct(id: string): Promise<MerchProduct | null> {
  const supabase = await createClient();
  const {data} = await supabase
    .from('merch_products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return (data ?? null) as MerchProduct | null;
}

export async function getMerchProductBySlug(
  slug: string
): Promise<MerchProduct | null> {
  const supabase = await createClient();
  const {data} = await supabase
    .from('merch_products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return (data ?? null) as MerchProduct | null;
}

export async function listMerchVariants(productId: string): Promise<MerchVariant[]> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('merch_variants')
    .select('*')
    .eq('product_id', productId)
    .order('display_order', {ascending: true})
    .order('created_at', {ascending: true});
  if (error || !data) return [];
  return data as MerchVariant[];
}

export async function getMerchProductWithVariantsBySlug(
  slug: string
): Promise<MerchProductWithVariants | null> {
  const product = await getMerchProductBySlug(slug);
  if (!product) return null;
  const variants = await listMerchVariants(product.id);
  return {...product, variants};
}

export async function getMerchProductWithVariants(
  id: string
): Promise<MerchProductWithVariants | null> {
  const product = await getMerchProduct(id);
  if (!product) return null;
  const variants = await listMerchVariants(product.id);
  return {...product, variants};
}

export async function listFaqCategories(): Promise<TableState<FaqCategory>> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('faq_categories')
    .select('*')
    .order('display_order', {ascending: true})
    .order('created_at', {ascending: true});
  if (error) {
    if (isMissingTable(error)) return {status: 'missing-table', rows: []};
    return {status: 'error', rows: [], error: error.message};
  }
  return {status: 'ok', rows: (data ?? []) as FaqCategory[]};
}

export async function getFaqCategory(id: string): Promise<FaqCategory | null> {
  const supabase = await createClient();
  const {data} = await supabase.from('faq_categories').select('*').eq('id', id).maybeSingle();
  return (data ?? null) as FaqCategory | null;
}

export async function listFaqItems(categoryId?: string): Promise<TableState<FaqItem>> {
  const supabase = await createClient();
  let query = supabase
    .from('faq_items')
    .select('*')
    .order('display_order', {ascending: true})
    .order('created_at', {ascending: true});
  if (categoryId) query = query.eq('category_id', categoryId);
  const {data, error} = await query;
  if (error) {
    if (isMissingTable(error)) return {status: 'missing-table', rows: []};
    return {status: 'error', rows: [], error: error.message};
  }
  return {status: 'ok', rows: (data ?? []) as FaqItem[]};
}

export async function getFaqItem(id: string): Promise<FaqItem | null> {
  const supabase = await createClient();
  const {data} = await supabase.from('faq_items').select('*').eq('id', id).maybeSingle();
  return (data ?? null) as FaqItem | null;
}

export async function listFaqWithItems(opts?: {
  publicOnly?: boolean;
}): Promise<TableState<FaqCategoryWithItems>> {
  const supabase = await createClient();
  let catQ = supabase
    .from('faq_categories')
    .select('*')
    .order('display_order', {ascending: true})
    .order('created_at', {ascending: true});
  let itemQ = supabase
    .from('faq_items')
    .select('*')
    .order('display_order', {ascending: true})
    .order('created_at', {ascending: true});
  if (opts?.publicOnly) {
    catQ = catQ.neq('status', 'draft');
    itemQ = itemQ.neq('status', 'draft');
  }
  const [catsRes, itemsRes] = await Promise.all([catQ, itemQ]);
  if (catsRes.error) {
    if (isMissingTable(catsRes.error)) return {status: 'missing-table', rows: []};
    return {status: 'error', rows: [], error: catsRes.error.message};
  }
  const cats = (catsRes.data ?? []) as FaqCategory[];
  const items = itemsRes.error ? [] : ((itemsRes.data ?? []) as FaqItem[]);
  const byCat = new Map<string, FaqItem[]>();
  for (const it of items) {
    const arr = byCat.get(it.category_id) ?? [];
    arr.push(it);
    byCat.set(it.category_id, arr);
  }
  return {
    status: 'ok',
    rows: cats.map((c) => ({...c, items: byCat.get(c.id) ?? []}))
  };
}

export async function listBookings(filter?: {
  status?: string;
}): Promise<TableState<Booking>> {
  const supabase = await createClient();
  let query = supabase.from('bookings').select('*').order('created_at', {ascending: false});
  if (filter?.status) query = query.eq('status', filter.status);
  const {data, error} = await query;
  if (error) {
    if (
      error.code === '42P01' ||
      error.code === 'PGRST204' ||
      (error.message ?? '').toLowerCase().includes('does not exist')
    ) {
      return {status: 'missing-table', rows: []};
    }
    return {status: 'error', rows: [], error: error.message};
  }
  return {status: 'ok', rows: (data ?? []) as Booking[]};
}

export async function getBooking(id: string): Promise<Booking | null> {
  const supabase = await createClient();
  const {data} = await supabase.from('bookings').select('*').eq('id', id).maybeSingle();
  return (data ?? null) as Booking | null;
}

export async function countBookingsByStatus(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const {data, error} = await supabase.from('bookings').select('status');
  if (error || !data) return {};
  const counts: Record<string, number> = {};
  for (const row of data) {
    const s = (row as {status: string}).status;
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return counts;
}

export type TripBookingSummary = {
  trip: Trip;
  total: number;
  party: number;
  byStatus: Record<BookingStatus, number>;
};

export async function listTripsWithBookingSummary(): Promise<
  TableState<TripBookingSummary>
> {
  const supabase = await createClient();
  const [tripsRes, bookingsRes] = await Promise.all([
    supabase.from('trips').select('*').order('start_date', {ascending: true}),
    supabase
      .from('bookings')
      .select('item_type,item_slug,status,party_size')
      .eq('item_type', 'trip')
  ]);
  if (tripsRes.error) {
    if (isMissingTable(tripsRes.error)) return {status: 'missing-table', rows: []};
    return {status: 'error', rows: [], error: tripsRes.error.message};
  }
  const trips = (tripsRes.data ?? []) as Trip[];
  const bookings = bookingsRes.error
    ? []
    : ((bookingsRes.data ?? []) as Array<{
        item_slug: string;
        status: BookingStatus;
        party_size: number;
      }>);

  const bySlug = new Map<string, {total: number; party: number; byStatus: Record<BookingStatus, number>}>();
  for (const b of bookings) {
    const slot = bySlug.get(b.item_slug) ?? {
      total: 0,
      party: 0,
      byStatus: {pending: 0, contacted: 0, confirmed: 0, cancelled: 0}
    };
    slot.total += 1;
    slot.party += b.party_size;
    slot.byStatus[b.status] += 1;
    bySlug.set(b.item_slug, slot);
  }

  const rows: TripBookingSummary[] = trips.map((trip) => {
    const slot = bySlug.get(trip.slug) ?? {
      total: 0,
      party: 0,
      byStatus: {pending: 0, contacted: 0, confirmed: 0, cancelled: 0} as Record<BookingStatus, number>
    };
    return {trip, total: slot.total, party: slot.party, byStatus: slot.byStatus};
  });
  return {status: 'ok', rows};
}

export async function listBookingsForTrip(
  tripSlug: string
): Promise<TableState<Booking>> {
  const supabase = await createClient();
  const {data, error} = await supabase
    .from('bookings')
    .select('*')
    .eq('item_type', 'trip')
    .eq('item_slug', tripSlug)
    .order('created_at', {ascending: false});
  if (error) {
    if (isMissingTable(error)) return {status: 'missing-table', rows: []};
    return {status: 'error', rows: [], error: error.message};
  }
  return {status: 'ok', rows: (data ?? []) as Booking[]};
}
