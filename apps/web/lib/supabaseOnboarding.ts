import { getSupabaseBrowserClient } from './supabase';

export interface OnboardingDataToSave {
  displayName: string;
  handle: string;
  homeArea: string;
  birthYear: number;
  avatarUrl?: string;
  bio?: string;
  q1Finding: string[];
  q2Feelings: string[];
  q3Energy: number;
  q3GroupSize: string;
  q4Connected: string[];
  q5PlanningRhythm: string;
  q5Availability: string[];
  q6Outings: string[];
  q7EmotionalPacing: string;
  q8Qualities: string[];
}

export async function saveOnboardingToSupabase(
  userId: string,
  data: OnboardingDataToSave
): Promise<{ success: boolean; error?: string; isDuplicateHandle?: boolean }> {
  try {
    const supabase = getSupabaseBrowserClient();

    // 1. Profiles Table Insert/Upsert with auth.uid()
    const profilePayload = {
      id: userId,
      handle: data.handle.trim().toLowerCase(),
      display_name: data.displayName.trim(),
      home_area: data.homeArea.trim(),
      birth_year: data.birthYear,
      avatar_url: data.avatarUrl || null,
      bio: data.bio || null,
      profile_version: 1,
      confidence: 0.35,
    };

    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileErr) {
      if (
        profileErr.code === '23505' ||
        profileErr.message.toLowerCase().includes('handle') ||
        profileErr.message.toLowerCase().includes('unique')
      ) {
        return {
          success: false,
          isDuplicateHandle: true,
          error: `The username "@${data.handle}" is already taken. Please choose another username.`,
        };
      }
      return {
        success: false,
        error: `Failed to save profile: ${profileErr.message}`,
      };
    }

    // 2. Trait Intent Table
    const intentsArr = data.q1Finding || [];
    const intentAnswered = intentsArr.length > 0 ? 1 : 0;
    const { error: intentErr } = await supabase.from('trait_intent').upsert(
      {
        user_id: userId,
        intents: intentsArr,
        depth: 2,
        answered: intentAnswered,
      },
      { onConflict: 'user_id' }
    );
    if (intentErr) {
      return { success: false, error: `Failed to save intent traits: ${intentErr.message}` };
    }

    // 3. Trait Communication Table
    const feelingsArr = data.q2Feelings || [];
    const connectedArr = data.q4Connected || [];
    const commAnswered = (feelingsArr.length > 0 ? 1 : 0) + (connectedArr.length > 0 ? 1 : 0);
    const { error: commErr } = await supabase.from('trait_communication').upsert(
      {
        user_id: userId,
        conv_styles: feelingsArr,
        mediums: connectedArr,
        answered: commAnswered,
      },
      { onConflict: 'user_id' }
    );
    if (commErr) {
      return { success: false, error: `Failed to save communication traits: ${commErr.message}` };
    }

    // 4. Trait Personality Table (Extraversion from Q3 Energy slider)
    const hasEnergy = typeof data.q3Energy === 'number' && !isNaN(data.q3Energy);
    const extraversionVal = hasEnergy
      ? Math.round((1 - data.q3Energy!) * 1000) / 1000
      : null;
    const persAnswered = hasEnergy ? 1 : 0;
    const { error: persErr } = await supabase.from('trait_personality').upsert(
      {
        user_id: userId,
        extraversion: extraversionVal,
        answered: persAnswered,
      },
      { onConflict: 'user_id' }
    );
    if (persErr) {
      return { success: false, error: `Failed to save personality traits: ${persErr.message}` };
    }

    // 5. Trait Social Rhythm Table
    let rhythmVal: number | null = null;
    let hasRhythm = false;
    if (data.q5PlanningRhythm && data.q5PlanningRhythm.trim()) {
      const pText = data.q5PlanningRhythm.trim();
      if (pText.includes('Spontaneous')) {
        rhythmVal = 0.2;
        hasRhythm = true;
      } else if (pText.includes('Flexible')) {
        rhythmVal = 0.5;
        hasRhythm = true;
      } else if (pText.includes('In advance') || pText.includes('Planned') || pText.includes('ahead')) {
        rhythmVal = 0.8;
        hasRhythm = true;
      }
    }

    const availArr = data.q5Availability || [];
    const rhythmAnswered = (availArr.length > 0 ? 1 : 0) + (hasRhythm ? 1 : 0);
    const { error: rhythmErr } = await supabase.from('trait_social_rhythm').upsert(
      {
        user_id: userId,
        availability: availArr,
        planning_horizon: rhythmVal,
        answered: rhythmAnswered,
      },
      { onConflict: 'user_id' }
    );
    if (rhythmErr) {
      return { success: false, error: `Failed to save social rhythm traits: ${rhythmErr.message}` };
    }

    // 6. Trait Experience Table
    let groupSizeVal: number | null = null;
    let hasGroupSize = false;
    if (data.q3GroupSize && data.q3GroupSize.trim()) {
      hasGroupSize = true;
      if (data.q3GroupSize === '1-on-1') {
        groupSizeVal = 0.0;
      } else if (data.q3GroupSize === '3-4 people') {
        groupSizeVal = 0.5;
      } else if (data.q3GroupSize === '5-6 people' || data.q3GroupSize === 'Big group') {
        groupSizeVal = 1.0;
      } else {
        hasGroupSize = false;
      }
    }

    const outingsArr = data.q6Outings || [];
    const qualitiesArr = data.q8Qualities || [];
    const expAnswered = (outingsArr.length > 0 ? 1 : 0) + (hasGroupSize ? 1 : 0) + (qualitiesArr.length > 0 ? 1 : 0);
    const { error: expErr } = await supabase.from('trait_experience').upsert(
      {
        user_id: userId,
        settings: outingsArr,
        group_size_pref: groupSizeVal,
        orientation: qualitiesArr,
        answered: expAnswered,
      },
      { onConflict: 'user_id' }
    );
    if (expErr) {
      return { success: false, error: `Failed to save experience traits: ${expErr.message}` };
    }

    // 7. Trait Emotional Table
    let paceVal: number | null = null;
    let hasPace = false;
    if (data.q7EmotionalPacing && data.q7EmotionalPacing.trim()) {
      const paceText = data.q7EmotionalPacing.trim();
      if (paceText.includes('Fast')) {
        paceVal = 0.9;
        hasPace = true;
      } else if (paceText.includes('Let it unfold')) {
        paceVal = 0.5;
        hasPace = true;
      } else if (paceText.includes('Slow') || paceText.includes('Cautious')) {
        paceVal = 0.2;
        hasPace = true;
      }
    }
    const emoAnswered = hasPace ? 1 : 0;
    const { error: emoErr } = await supabase.from('trait_emotional').upsert(
      {
        user_id: userId,
        er_opening_pace: paceVal,
        answered: emoAnswered,
      },
      { onConflict: 'user_id' }
    );
    if (emoErr) {
      return { success: false, error: `Failed to save emotional traits: ${emoErr.message}` };
    }

    // 8. Trait Geography Table
    const { error: geoErr } = await supabase.from('trait_geography').upsert(
      {
        user_id: userId,
        home_area: data.homeArea.trim(),
        answered: 1,
      },
      { onConflict: 'user_id' }
    );
    if (geoErr) {
      return { success: false, error: `Failed to save geography traits: ${geoErr.message}` };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while saving your profile to Supabase.',
    };
  }
}
