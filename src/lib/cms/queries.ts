import 'server-only';
import {createClient} from '@/lib/supabase/server';
import type {Booking, Course, DiveSite, Trip} from './types';

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
