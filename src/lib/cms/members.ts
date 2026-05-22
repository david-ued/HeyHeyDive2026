import 'server-only';

import {randomBytes} from 'node:crypto';
import {createAdminClient} from '@/lib/supabase/admin-client';

export type EnsureMemberResult =
  | {ok: true; userId: string; email: string; created: boolean; password: string | null}
  | {ok: false; error: string};

/**
 * Ensure an `auth.users` row exists for the email on a booking, and link the
 * booking row to it via `bookings.user_id`.
 *
 * Returns the generated password ONCE — only when we just created the auth
 * account. Caller is responsible for showing it to the admin so they can pass
 * it along to the customer; we never store it in plaintext anywhere.
 */
export async function ensureMemberAccountForBooking(
  bookingId: string
): Promise<EnsureMemberResult> {
  const admin = createAdminClient();

  const {data: booking, error: bookingErr} = await admin
    .from('bookings')
    .select('id, contact_email, contact_name, user_id')
    .eq('id', bookingId)
    .maybeSingle();
  if (bookingErr) return {ok: false, error: bookingErr.message};
  if (!booking) return {ok: false, error: 'Booking not found'};

  const email = (booking.contact_email ?? '').trim().toLowerCase();
  if (!email) return {ok: false, error: 'Booking has no email'};

  if (booking.user_id) {
    return {ok: true, userId: booking.user_id, email, created: false, password: null};
  }

  const existing = await findAuthUserByEmail(email);

  if (existing) {
    const {error: linkErr} = await admin
      .from('bookings')
      .update({user_id: existing.id})
      .eq('id', bookingId);
    if (linkErr) return {ok: false, error: linkErr.message};
    return {ok: true, userId: existing.id, email, created: false, password: null};
  }

  const password = generatePassword();
  const {data: created, error: createErr} = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: booking.contact_name ?? '',
      role: 'member'
    }
  });
  if (createErr || !created.user) {
    return {ok: false, error: createErr?.message ?? 'Failed to create auth user'};
  }

  const {error: linkErr} = await admin
    .from('bookings')
    .update({user_id: created.user.id})
    .eq('id', bookingId);
  if (linkErr) return {ok: false, error: linkErr.message};

  // Also retro-link every other booking that shares this email.
  await admin
    .from('bookings')
    .update({user_id: created.user.id})
    .eq('contact_email', email)
    .is('user_id', null);

  return {ok: true, userId: created.user.id, email, created: true, password};
}

async function findAuthUserByEmail(email: string) {
  const admin = createAdminClient();
  // Auth admin API has no direct getByEmail; page through users until found.
  // Existing bookings list shows perPage 200 works fine for the scale of this app.
  let page = 1;
  while (page <= 10) {
    const {data, error} = await admin.auth.admin.listUsers({page, perPage: 200});
    if (error) return null;
    const match = data.users.find((u) => (u.email ?? '').toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 200) return null;
    page += 1;
  }
  return null;
}

/**
 * Cryptographically random password — 14 chars, mixed case + digits.
 * Avoid lookalikes (0/O, 1/l/I) so admins can read it back to customers cleanly.
 */
function generatePassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(14);
  let out = '';
  for (let i = 0; i < 14; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
