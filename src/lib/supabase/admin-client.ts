import 'server-only';
import {createClient} from '@supabase/supabase-js';

/**
 * Service-role Supabase client. Server-only — NEVER import from a client component.
 * Bypasses RLS. Use sparingly, only for admin actions that must elevate privileges.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }
  return createClient(url, serviceKey, {
    auth: {persistSession: false, autoRefreshToken: false}
  });
}
