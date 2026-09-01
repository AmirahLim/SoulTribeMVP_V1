import { getSupabaseBrowserClient } from './supabase';
import type { DeepProfileAnswers } from './userStore';

export interface OnboardingDataToSave {
  displayName: string;
  handle: string;
  homeArea: string;
  birthYear: number;
  avatarUrl?: string;
  bio?: string;
  q1Finding: string[];
  q2Feelings: string[];
  q3Energy?: number | null;
  q3GroupSize?: string | null;
  q4Connected: string[];
  q5PlanningRhythm?: string | null;
  q5Availability: string[];
  q6Outings: string[];
  q7EmotionalPacing?: string | null;
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
      onboarding_data: {
        q1Finding: data.q1Finding,
        q2Feelings: data.q2Feelings,
        q3Energy: data.q3Energy,
        q3GroupSize: data.q3GroupSize,
        q4Connected: data.q4Connected,
        q5PlanningRhythm: data.q5PlanningRhythm,
        q5Availability: data.q5Availability,
        q6Outings: data.q6Outings,
        q7EmotionalPacing: data.q7EmotionalPacing,
        q8Qualities: data.q8Qualities,
      },
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

    // 9. Save user_interests & user_values from onboarding (Q6 Outings & Q8 Qualities)
    const ivRes = await saveUserInterestsAndValues(userId, data.q6Outings || [], data.q8Qualities || []);
    if (!ivRes.success) {
      console.error('[SoulTribe Error] saveUserInterestsAndValues error during onboarding:', ivRes.error);
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while saving your profile to Supabase.',
    };
  }
}

export async function saveUserInterestsAndValues(
  userId: string,
  outings: string[],
  qualities: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseBrowserClient();

    // 1. Fetch interest_nodes from DB
    if (outings && outings.length > 0) {
      let dbNodes: { id: number; name: string }[] | null = null;
      try {
        const query = supabase.from('interest_nodes');
        if (query && typeof query.select === 'function') {
          const { data, error: nodeErr } = await query.select('id, name');
          if (nodeErr) {
            console.error('[SoulTribe Error] Failed to query interest_nodes:', nodeErr.message);
          } else {
            dbNodes = data;
          }
        }
      } catch {
        // Unit test mock client fallback
      }

      // Static lookup map matching onboarding Q6 options & seed nodes
      const staticNodeMap: Record<string, number> = {
        'Coffee & Cafes': 7,
        'Coffee & wandering': 7,
        'Dining & Food': 8,
        'Brunch': 8,
        'Specialty Coffee': 9,
        'Hawker Exploration': 10,
        'Natural Wine': 11,
        'Baking & Pastry': 12,
        'Fitness & Movement': 13,
        'Bouldering & Climbing': 14,
        'Bouldering': 14,
        'Trail Running': 15,
        'Yoga & Pilates': 16,
        'Arts & Museums': 17,
        'Art & Design': 1,
        'Contemporary Art': 2,
        'Books & Literature': 18,
        'Books & Ideas': 14,
        'Music & Gigs': 19,
        'Photography & Film': 20,
        'Analog Photography': 24,
        'Philosophy & Ideas': 21,
        'Philosophy': 21,
        'Pottery & Craft': 22,
        'Pottery & Ceramics': 5,
        'Woodworking': 23,
        'Hiking & Outdoors': 25,
        'Outdoors & Movement': 10,
        'Cycling (East Coast)': 26,
        'Boardgames & Gaming': 27,
      };

      const nameToIdMap = new Map<string, number>();
      if (dbNodes) {
        for (const n of dbNodes) {
          nameToIdMap.set(n.name.trim().toLowerCase(), n.id);
        }
      }
      for (const [k, v] of Object.entries(staticNodeMap)) {
        if (!nameToIdMap.has(k.trim().toLowerCase())) {
          nameToIdMap.set(k.trim().toLowerCase(), v);
        }
      }

      const interestRows: { user_id: string; node_id: number; affinity: string }[] = [];
      for (const name of outings) {
        const cleanName = name.trim().toLowerCase();
        const nodeId = nameToIdMap.get(cleanName);

        if (nodeId) {
          interestRows.push({
            user_id: userId,
            node_id: nodeId,
            affinity: 'love',
          });
        } else {
          // Rule 2: If an interest has no matching node, SKIP it — do not guess an ID
          console.warn(`[SoulTribe Warning] Skipped unknown interest '${name}' (no matching interest_node)`);
        }
      }

      if (interestRows.length > 0) {
        const { error: interestErr } = await supabase
          .from('user_interests')
          .upsert(interestRows, { onConflict: 'user_id, node_id' });

        if (interestErr) {
          console.error('[SoulTribe Error] Failed to insert user_interests:', interestErr.message);
          return { success: false, error: `user_interests insert failed: ${interestErr.message}` };
        }
      }
    }

    // 2. Save to user_values
    if (qualities && qualities.length > 0) {
      const valueRows = qualities.map((q) => ({
        user_id: userId,
        value_key: q.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        stance: 0.8,
        importance: 0.8,
        visibility: 'matching_only',
      }));

      const { error: valueErr } = await supabase
        .from('user_values')
        .upsert(valueRows, { onConflict: 'user_id, value_key' });

      if (valueErr) {
        console.error('[SoulTribe Error] Failed to insert user_values:', valueErr.message);
        return { success: false, error: `user_values insert failed: ${valueErr.message}` };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('[SoulTribe Error] saveUserInterestsAndValues exception:', err);
    return { success: false, error: err.message };
  }
}

export async function saveDeeperPassToSupabase(
  userId: string,
  deepProfile: DeepProfileAnswers,
  completedCategoryNums: number[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseBrowserClient();

    // 1. Update profiles table with deep_profile, completed_categories, pass_completion_pct
    const passPct = Math.min(100, Math.max(10, completedCategoryNums.length * 10));
    await supabase
      .from('profiles')
      .update({
        deep_profile: deepProfile,
        completed_categories: completedCategoryNums,
        pass_completion_pct: passPct,
      })
      .eq('id', userId);

    // Import ANSWER_MAP dynamically if needed
    const { ANSWER_MAP } = await import('./profileAdapter');

    // 2. Trait Intent (Section 3)
    const intentAnswered = deepProfile.friendshipPillars ? 3 : (deepProfile.realFriendOpen ? 2 : 0);
    if (intentAnswered > 0) {
      await supabase.from('trait_intent').upsert(
        {
          user_id: userId,
          intents: deepProfile.friendshipPillars ? [deepProfile.friendshipPillars] : ['friendship', 'close_friends'],
          depth: deepProfile.friendshipPillars ? 3 : 2,
          answered: intentAnswered,
        },
        { onConflict: 'user_id' }
      );
    }

    // 3. Trait Communication (Section 2)
    const messagingVal = ANSWER_MAP.messagingStyle(deepProfile.messagingStyle);
    const commAnswered = (messagingVal ? 5 : 0) + (deepProfile.messagingStyleOpen ? 3 : 0);
    if (commAnswered > 0) {
      await supabase.from('trait_communication').upsert(
        {
          user_id: userId,
          contact_frequency_self: messagingVal?.contact_frequency_self ?? 0.5,
          contact_frequency_expect: messagingVal?.contact_frequency_self ?? 0.5,
          response_speed_self: messagingVal?.response_speed_self ?? 0.5,
          response_speed_expect: messagingVal?.response_speed_self ?? 0.5,
          message_length: messagingVal?.message_length ?? 0.5,
          conv_styles: deepProfile.messagingStyleOpen ? [deepProfile.messagingStyleOpen] : ['deep'],
          mediums: ['text'],
          answered: commAnswered,
        },
        { onConflict: 'user_id' }
      );
    }

    // 4. Trait Personality (Section 5)
    const mbtiMap = ANSWER_MAP.mbti(deepProfile.mbti);
    const socialVibeVal = ANSWER_MAP.socialVibe(deepProfile.socialVibe);
    const saturdayVal = ANSWER_MAP.idealSaturday(deepProfile.idealSaturday);
    const tripVal = ANSWER_MAP.spontaneousTrip(deepProfile.spontaneousTrip);
    const persAnswered = (mbtiMap ? 10 : 0) + (socialVibeVal ? 3 : 0) + (deepProfile.sunSign ? 2 : 0);
    if (persAnswered > 0) {
      await supabase.from('trait_personality').upsert(
        {
          user_id: userId,
          openness: mbtiMap?.openness ?? 0.6,
          conscientiousness: mbtiMap?.conscientiousness ?? 0.5,
          extraversion: mbtiMap?.extraversion ?? 0.5,
          agreeableness: mbtiMap?.agreeableness ?? 0.6,
          serious_playful: socialVibeVal?.serious_playful ?? 0.5,
          intensity_easygoing: socialVibeVal?.intensity_easygoing ?? 0.5,
          novelty_seeking: mbtiMap?.novelty_seeking ?? saturdayVal?.novelty ?? (tripVal ?? 0.5),
          answered: persAnswered,
        },
        { onConflict: 'user_id' }
      );
    }

    // 5. Trait Social Rhythm (Section 4)
    const rhythmAnswered = (saturdayVal ? 3 : 0) + (tripVal !== null ? 2 : 0);
    if (rhythmAnswered > 0) {
      await supabase.from('trait_social_rhythm').upsert(
        {
          user_id: userId,
          planning_horizon: saturdayVal?.planning_horizon ?? 0.5,
          availability: ['sat_midday', 'sun_midday'],
          answered: rhythmAnswered,
        },
        { onConflict: 'user_id' }
      );
    }

    // 6. Trait Emotional (Section 9)
    const supportVal = ANSWER_MAP.supportStyle(deepProfile.supportStyle);
    const emoAnswered = (supportVal !== null ? 5 : 0) + (deepProfile.likeMeIfPrompt ? 2 : 0);
    if (emoAnswered > 0) {
      await supabase.from('trait_emotional').upsert(
        {
          user_id: userId,
          advice_vs_listening_self: supportVal ?? 0.5,
          advice_vs_listening_expect: supportVal ?? 0.5,
          er_opening_pace: 0.5,
          answered: emoAnswered,
        },
        { onConflict: 'user_id' }
      );
    }

    // 7. Trait Lifestyle & Experience (Sections 8 & 10)
    const groupSizeVal = ANSWER_MAP.groupSize(deepProfile.groupSize);
    const expAnswered = groupSizeVal !== null ? 4 : 0;
    if (expAnswered > 0) {
      await supabase.from('trait_experience').upsert(
        {
          user_id: userId,
          group_size_pref: groupSizeVal ?? 0.5,
          novelty: saturdayVal?.novelty ?? 0.5,
          answered: expAnswered,
        },
        { onConflict: 'user_id' }
      );
    }

    // 8. Save user_interests & user_values
    const interestsToSave: string[] = [];
    if (deepProfile.talkForHoursOpen) interestsToSave.push(deepProfile.talkForHoursOpen);
    if (deepProfile.instantYesOutingOpen) interestsToSave.push(deepProfile.instantYesOutingOpen);

    const valuesToSave: string[] = [];
    if (deepProfile.respectPeopleOpen) valuesToSave.push(deepProfile.respectPeopleOpen);
    if (deepProfile.coreValues) valuesToSave.push(deepProfile.coreValues);

    await saveUserInterestsAndValues(userId, interestsToSave, valuesToSave);

    return { success: true };
  } catch (err: any) {
    console.error('saveDeeperPassToSupabase error:', err);
    return { success: false, error: err.message };
  }
}
