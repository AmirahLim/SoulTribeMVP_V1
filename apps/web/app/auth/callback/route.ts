import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {claimOnboardingServer} from '../../../lib/claimOnboardingServer';
import {ELIGIBILITY_COOKIE} from '../../../lib/eligibilityProof';

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
  const requestedNext = searchParams.get('next') ?? '/home';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') && !requestedNext.includes('\\') ? requestedNext : '/home';

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
  const { data: { user },error:userError } = await supabase.auth.getUser();
  if(userError||!user){
    response.headers.set('location',new URL('/auth/signin?error=exchange_failed',origin).toString());
    return response;
  }

  if (user) {
    if(next==='/home?onboarding=complete') {
      // Claim with the exchanged user's session, never a service-role client.
      // Keep response cookies on both success and failure so retry stays signed in.
      try {
        const result=await claimOnboardingServer(supabase,user,request.cookies.get('st_onboarding_v2')?.value,request.cookies.get(ELIGIBILITY_COOKIE)?.value);
        response.headers.set('location',new URL(result.status===200?'/home':'/early-read?finish=1',origin).toString());
      } catch(error) {
        const failure=error as {code?:string;message?:string};
        console.error('[SoulTribe] OAuth onboarding handoff failed',{code:failure.code,message:failure.message});
        response.headers.set('location',new URL('/early-read?finish=1',origin).toString());
      }
      return response;
    }
    // A verified onboarding member must claim the private draft before profile creation.
    // Return the existing response so all exchanged session cookies reach the browser.
    if (next === '/early-read') return response;
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
      response.headers.set('location', usernameUrl.toString());
      return response;
    }
  }

  // Success with a valid profile → redirect to the requested destination
  return response;
}
