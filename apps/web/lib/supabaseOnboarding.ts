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
    const intentAnswered = data.q1Finding.length > 0 ? 1 : 0;
    const { error: intentErr } = await supabase.from('trait_intent').upsert(
      {
        user_id: userId,
        intents: data.q1Finding,
        depth: 2,
        answered: intentAnswered,
      },
      { onConflict: 'user_id' }
    );
    if (intentErr) {
      return { success: false, error: `Failed to save intent traits: ${intentErr.message}` };
    }

    // 3. Trait Communication Table
    const commAnswered = (data.q2Feelings.length > 0 ? 1 : 0) + (data.q4Connected.length > 0 ? 1 : 0);
    const { error: commErr } = await supabase.from('trait_communication').upsert(
      {
        user_id: userId,
        conv_styles: data.q2Feelings,
        mediums: data.q4Connected,
        answered: commAnswered,
      },
      { onConflict: 'user_id' }
    );
    if (commErr) {
      return { success: false, error: `Failed to save communication traits: ${commErr.message}` };
    }

    // 4. Trait Personality Table (Extraversion from Q3 Energy slider)
    const extraversionVal = Math.round((1 - data.q3Energy) * 1000) / 1000;
    const { error: persErr } = await supabase.from('trait_personality').upsert(
      {
        user_id: userId,
        extraversion: extraversionVal,
        answered: 1,
      },
      { onConflict: 'user_id' }
    );
    if (persErr) {
      return { success: false, error: `Failed to save personality traits: ${persErr.message}` };
    }

    // 5. Trait Social Rhythm Table
    const rhythmVal = data.q5PlanningRhythm.includes('Spontaneous')
      ? 0.2
      : data.q5PlanningRhythm.includes('Flexible')
      ? 0.5
      : 0.8;
    const rhythmAnswered = (data.q5Availability.length > 0 ? 1 : 0) + (data.q5PlanningRhythm ? 1 : 0);
    const { error: rhythmErr } = await supabase.from('trait_social_rhythm').upsert(
      {
        user_id: userId,
        availability: data.q5Availability,
        planning_horizon: rhythmVal,
        answered: rhythmAnswered,
      },
      { onConflict: 'user_id' }
    );
    if (rhythmErr) {
      return { success: false, error: `Failed to save social rhythm traits: ${rhythmErr.message}` };
    }

    // 6. Trait Experience Table
    const groupSizeVal = data.q3GroupSize === '1-on-1' ? 0.0 : data.q3GroupSize === '3-4 people' ? 0.5 : 1.0;
    const expAnswered = (data.q6Outings.length > 0 ? 1 : 0) + (data.q3GroupSize ? 1 : 0) + (data.q8Qualities.length > 0 ? 1 : 0);
    const { error: expErr } = await supabase.from('trait_experience').upsert(
      {
        user_id: userId,
        settings: data.q6Outings,
        group_size_pref: groupSizeVal,
        orientation: data.q8Qualities,
        answered: expAnswered,
      },
      { onConflict: 'user_id' }
    );
    if (expErr) {
      return { success: false, error: `Failed to save experience traits: ${expErr.message}` };
    }

    // 7. Trait Emotional Table
    const paceVal = data.q7EmotionalPacing.includes('Fast')
      ? 0.9
      : data.q7EmotionalPacing.includes('Let it unfold')
      ? 0.5
      : 0.2;
    const { error: emoErr } = await supabase.from('trait_emotional').upsert(
      {
        user_id: userId,
        er_opening_pace: paceVal,
        answered: data.q7EmotionalPacing ? 1 : 0,
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
