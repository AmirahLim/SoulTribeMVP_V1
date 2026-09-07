import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '../lib/supabaseServer';
import LandingPageContent from './LandingPageContent';

/**
 * Root page — server component.
 *
 * Checks for an active Supabase session. If the user is already signed in,
 * they are redirected to /home server-side (no flash of the marketing page).
 * Otherwise, renders the public landing page.
 */
export default async function RootPage() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      redirect('/home');
    }
  } catch {
    // If Supabase isn't configured or the check fails, fall through to
    // render the landing page. This ensures the app works in local dev
    // without env vars.
  }

  return <LandingPageContent />;
}
