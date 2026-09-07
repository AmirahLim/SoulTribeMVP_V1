import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * GET /auth/callback
 *
 * Handles the PKCE code exchange after a magic-link click or OAuth redirect.
 * Replaces the old client-component page.tsx that used the implicit-flow pattern
 * (getSession + onAuthStateChange) which does not work with PKCE.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';

  // No code parameter at all → send to sign-in
  if (!code) {
    return NextResponse.redirect(new URL('/auth/signin', origin));
  }

  // Build a server Supabase client wired to request/response cookies
  const response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Exchange the PKCE code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Exchange failed — redirect to sign-in with a visible error
    const errorUrl = new URL('/auth/signin', origin);
    errorUrl.searchParams.set('error', 'exchange_failed');
    return NextResponse.redirect(errorUrl);
  }

  // Check if the user has a profile with a handle
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, handle')
      .eq('id', user.id)
      .maybeSingle();

    // No handle yet → send to username step
    if (!profile || !profile.handle) {
      const usernameUrl = new URL('/auth/signin', origin);
      usernameUrl.searchParams.set('step', 'choose_username');
      usernameUrl.searchParams.set('next', next);
      return NextResponse.redirect(usernameUrl);
    }
  }

  // Success with a valid profile → redirect to the requested destination
  return response;
}
