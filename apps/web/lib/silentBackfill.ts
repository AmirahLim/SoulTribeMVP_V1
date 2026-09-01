import { getUserProfile } from './userStore';
import { checkIsSupabaseConfigured, getSupabaseBrowserClient } from './supabase';
import { saveDeeperPassToSupabase } from './supabaseOnboarding';

const BACKFILL_STORAGE_KEY = 'soul_tribe_deeper_pass_backfilled_v1';

export async function runSilentDeeperPassBackfill(userId: string): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  if (!checkIsSupabaseConfigured() || !userId) return;

  const backfillKey = `${BACKFILL_STORAGE_KEY}_${userId}`;
  if (localStorage.getItem(backfillKey) === 'true') {
    return;
  }

  try {
    const localProfile = getUserProfile();
    const localDeep = localProfile.deepProfile || {};
    const localCats = localProfile.completedCategoryNums || [];

    if (Object.keys(localDeep).length === 0 && localCats.length === 0) {
      localStorage.setItem(backfillKey, 'true');
      return;
    }

    const supabase = getSupabaseBrowserClient();

    // Query existing server traits / profile
    const { data: serverProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('deep_profile, completed_categories')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) {
      console.warn('[SoulTribe Backfill] Silent check warning:', profileErr.message);
    }

    const serverDeep = (serverProfile?.deep_profile as Record<string, any>) || {};
    const serverCats: number[] = (serverProfile?.completed_categories as number[]) || [];

    // SERVER ANSWERS WIN: Only fill keys where server is empty/missing
    const mergedDeep: Record<string, any> = { ...localDeep };
    for (const key of Object.keys(serverDeep)) {
      if (serverDeep[key] !== null && serverDeep[key] !== undefined && serverDeep[key] !== '') {
        mergedDeep[key] = serverDeep[key];
      }
    }

    const mergedCatsSet = new Set<number>([...serverCats]);
    const backfilledCategoryNums: number[] = [];

    for (const catNum of localCats) {
      if (!serverCats.includes(catNum)) {
        mergedCatsSet.add(catNum);
        backfilledCategoryNums.push(catNum);
      }
    }

    const localDeepObj = (localDeep as Record<string, any>) || {};
    const finalCats = Array.from(mergedCatsSet).sort((a, b) => a - b);
    const hasUnansweredServerKeys = Object.keys(localDeepObj).some(
      (k) => localDeepObj[k] && !serverDeep[k]
    );

    if (backfilledCategoryNums.length > 0 || hasUnansweredServerKeys) {
      const res = await saveDeeperPassToSupabase(userId, mergedDeep, finalCats);
      if (res.success) {
        console.log(
          `[SoulTribe Backfill] Silently backfilled local Tribal Pass answers to Supabase for user ${userId}. Backfilled categories:`,
          backfilledCategoryNums
        );
      } else {
        console.warn('[SoulTribe Backfill] Save error:', res.error);
      }
    }

    localStorage.setItem(backfillKey, 'true');
  } catch (err: any) {
    console.warn('[SoulTribe Backfill] Exception caught during silent backfill:', err?.message || err);
    try {
      localStorage.setItem(backfillKey, 'true');
    } catch {}
  }
}
