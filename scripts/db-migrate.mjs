#!/usr/bin/env node
/**
 * Apply SQL migrations under supabase/migrations to the project DB.
 *
 * Requires SUPABASE_DB_URL in .env.local (Dashboard → Project Settings → Database → URI).
 * Looks like: postgresql://postgres.<ref>:<password>@aws-...pooler.supabase.com:6543/postgres
 *
 * Falls back to clear instructions when SUPABASE_DB_URL is missing.
 *
 * Usage: pnpm db:migrate
 */

import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '..', 'supabase', 'migrations');

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.log('');
  console.log('SUPABASE_DB_URL not set in .env.local — pick one option:');
  console.log('');
  console.log('  A) Paste the SQL into the Supabase Dashboard SQL Editor:');
  console.log(`     ${migrationsDir}/0001_init_cms.sql`);
  console.log('     Dashboard → SQL Editor → New query → paste → Run');
  console.log('');
  console.log('  B) Add SUPABASE_DB_URL to .env.local then re-run `pnpm db:migrate`:');
  console.log('     Dashboard → Project Settings → Database → Connection string → URI');
  console.log('     (use the "Session pooler" string; format below)');
  console.log('     SUPABASE_DB_URL=postgresql://postgres.<ref>:<pw>@aws-...pooler.supabase.com:6543/postgres');
  console.log('');
  process.exit(1);
}

let pg;
try {
  ({default: pg} = await import('pg'));
} catch {
  console.error('✗ Missing dependency: pg');
  console.error('  Run: pnpm add -D pg');
  process.exit(1);
}

const files = (await readdir(migrationsDir))
  .filter((f) => f.endsWith('.sql'))
  .sort();

if (!files.length) {
  console.log('No migrations to apply.');
  process.exit(0);
}

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: {rejectUnauthorized: false}
});

try {
  await client.connect();
  console.log(`→ Connected to ${maskUrl(dbUrl)}`);
  for (const file of files) {
    const sql = await readFile(path.join(migrationsDir, file), 'utf8');
    console.log(`→ Applying ${file}`);
    await client.query(sql);
    console.log(`✓ ${file}`);
  }
  console.log('');
  console.log('All migrations applied.');
} catch (e) {
  console.error('');
  console.error('✗ Migration failed:', e?.message ?? e);
  process.exit(1);
} finally {
  await client.end();
}

function maskUrl(url) {
  return url.replace(/:[^:@/]+@/, ':***@');
}
