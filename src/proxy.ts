import createMiddleware from 'next-intl/middleware';
import {type NextRequest} from 'next/server';
import {updateSession} from '@/lib/supabase/middleware';
import {routing} from '@/i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  const intlResponse = handleI18nRouting(request);

  if (intlResponse.headers.get('location')) {
    return intlResponse;
  }

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
