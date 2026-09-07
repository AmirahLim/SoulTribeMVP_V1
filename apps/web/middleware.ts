import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Auth middleware — refreshes the Supabase session cookie on every navigation.
 *
 * Without this middleware, the cookie-backed session from @supabase/ssr is never
 * refreshed and can expire between page loads, causing the user to appear signed
 * out even though a valid refresh token exists.
 *
 * This middleware does NOT add route protection — AuthGuard handles that client-side.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // If Supabase isn't configured, pass through without touching cookies
  if (!url || !url.trim() || !key || !key.trim()) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do NOT use getSession() here.
  // getUser() sends a request to the Supabase Auth server every time to
  // revalidate the Auth token, while getSession() reads from local storage.
  // Using getUser() ensures the session cookie is refreshed.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - Common image/font extensions
     * - /api/ routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$|api/).*)',
  ],
};
