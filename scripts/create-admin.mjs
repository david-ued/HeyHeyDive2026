#!/usr/bin/env node
/**
 * Create (or upgrade) a Supabase user to admin.
 *
 * Run:
 *   pnpm setup:admin                                # interactive defaults
 *   ADMIN_EMAIL=you@example.com pnpm setup:admin   # override email
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm setup:admin
 *
 * Loads env from .env.local via `node --env-file=.env.local`.
 * Requires SUPABASE_SERVICE_ROLE_KEY — service role bypasses RLS to set app_metadata.role.
 */

import {createClient} from '@supabase/supabase-js';
import {randomBytes} from 'node:crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    '✗ Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
  );
  console.error('  Make sure .env.local is filled in and run via `pnpm setup:admin`.');
  process.exit(1);
}

const email = (process.env.ADMIN_EMAIL ?? 'davidinthebox2026@gmail.com').trim();
const password = process.env.ADMIN_PASSWORD ?? generatePassword();
const generated = !process.env.ADMIN_PASSWORD;

function generatePassword() {
  // 16-char base64url password — strong, not painful to type.
  return randomBytes(12).toString('base64url');
}

const admin = createClient(url, serviceKey, {
  auth: {persistSession: false, autoRefreshToken: false}
});

async function findUserByEmail(email) {
  // Paginate (max 1000 per page) until we find the user or run out.
  for (let page = 1; page <= 50; page++) {
    const {data, error} = await admin.auth.admin.listUsers({page, perPage: 1000});
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 1000) return null;
  }
  return null;
}

console.log(`→ Targeting ${url}`);
console.log(`→ Admin email: ${email}`);

try {
  const existing = await findUserByEmail(email);
  let user;
  let action;

  if (existing) {
    const {data, error} = await admin.auth.admin.updateUserById(existing.id, {
      app_metadata: {...existing.app_metadata, role: 'admin'},
      ...(process.env.ADMIN_PASSWORD ? {password} : {})
    });
    if (error) throw error;
    user = data.user;
    action = 'upgraded';
  } else {
    const {data, error} = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: {role: 'admin'}
    });
    if (error) throw error;
    user = data.user;
    action = 'created';
  }

  console.log('');
  console.log(`✓ Admin ${action}`);
  console.log(`  user id : ${user.id}`);
  console.log(`  email   : ${user.email}`);
  console.log(`  role    : ${user.app_metadata?.role}`);
  if (action === 'created' && generated) {
    console.log('');
    console.log('  Temporary password (shown once — change it after first login):');
    console.log(`    ${password}`);
  } else if (action === 'upgraded' && !process.env.ADMIN_PASSWORD) {
    console.log('');
    console.log('  Password unchanged. Use existing credentials, or set ADMIN_PASSWORD to reset.');
  } else if (process.env.ADMIN_PASSWORD) {
    console.log('');
    console.log('  Password set from ADMIN_PASSWORD env var.');
  }
  console.log('');
  console.log('  Sign in at: /zh-TW/admin/login');
} catch (e) {
  console.error('✗ Failed:', e?.message ?? e);
  process.exit(1);
}
