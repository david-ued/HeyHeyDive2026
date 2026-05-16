import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {createClient as createSSRClient} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: url ? 'set' : 'missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? 'set' : 'missing',
    SUPABASE_SERVICE_ROLE_KEY: serviceKey ? 'set' : 'missing'
  };

  if (!url || !anonKey) {
    return NextResponse.json(
      {ok: false, stage: 'env', env},
      {status: 500}
    );
  }

  const results: Record<string, unknown> = {env};

  // 1. SSR client (cookie-aware). "Auth session missing!" is the expected
  //    response when the caller has no cookie — it still proves the round-trip works.
  try {
    const supabase = await createSSRClient();
    const {data, error} = await supabase.auth.getUser();
    if (error && error.message !== 'Auth session missing!') {
      results.ssrAuthGetUser = {ok: false, error: error.message};
    } else {
      results.ssrAuthGetUser = {
        ok: true,
        signedIn: !!data.user,
        userId: data.user?.id ?? null
      };
    }
  } catch (e) {
    results.ssrAuthGetUser = {ok: false, threw: String(e)};
  }

  // 2. Auth settings via anon key — confirms the project is reachable.
  try {
    const r = await fetch(`${url}/auth/v1/settings`, {
      headers: {apikey: anonKey},
      cache: 'no-store'
    });
    results.authSettings = {ok: r.ok, status: r.status};
  } catch (e) {
    results.authSettings = {ok: false, threw: String(e)};
  }

  // 3. Service-role admin call — confirms secret key is valid.
  if (serviceKey) {
    try {
      const admin = createClient(url, serviceKey, {
        auth: {persistSession: false, autoRefreshToken: false}
      });
      const {data, error} = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      results.serviceRoleListUsers = error
        ? {ok: false, error: error.message}
        : {ok: true, total: data.users.length, aud: data.aud};
    } catch (e) {
      results.serviceRoleListUsers = {ok: false, threw: String(e)};
    }
  }

  const allOk =
    (results.ssrAuthGetUser as {ok: boolean}).ok &&
    (results.authSettings as {ok: boolean}).ok &&
    (!serviceKey ||
      (results.serviceRoleListUsers as {ok: boolean}).ok);

  return NextResponse.json({ok: allOk, ...results});
}
