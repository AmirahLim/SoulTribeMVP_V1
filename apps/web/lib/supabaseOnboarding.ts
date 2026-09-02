import { getSupabaseBrowserClient } from './supabase';
import type { DeepProfileAnswers } from './userStore';
import { ONBOARDING_INTEREST_NODES } from '@soul-tribe/core';

export interface OnboardingDataToSave {
  displayName: string;
  handle: string;
  homeArea: string;
  birthYear?: number | null;
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

async function mergeAndUpsertTraitTable(
  supabase: any,
  table: string,
  userId: string,
  newFields: Record<string, any>
) {
  let existingRow: Record<string, any> = {};
  try {
    const query = supabase.from(table);
    if (query && typeof query.select === 'function') {
      const { data } = await query.select('*').eq('user_id', userId).maybeSingle();
      if (data) existingRow = data;
    }
  } catch {
    // Ignore error in unit test mocks
  }

  const merged: Record<string, any> = { ...existingRow, user_id: userId };
  for (const [k, v] of Object.entries(newFields)) {
    if (v !== undefined) {
      merged[k] = v;
    }
  }

  const ignoreKeys = ['user_id', 'created_at', 'updated_at', 'answered'];
  const answeredCount = Object.entries(merged).filter(([k, v]) => {
    if (ignoreKeys.includes(k)) return false;
    if (v === null || v === undefined) return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }).length;

  merged.answered = answeredCount;

  return supabase.from(table).upsert(merged, { onConflict: 'user_id' });
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
      birth_year: typeof data.birthYear === 'number' && !isNaN(data.birthYear) ? data.birthYear : null,
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
    const { error: intentErr } = await mergeAndUpsertTraitTable(supabase, 'trait_intent', userId, {
      intents: intentsArr.length > 0 ? intentsArr : undefined,
    });
    if (intentErr) {
      return { success: false, error: `Failed to save intent traits: ${intentErr.message}` };
    }

    // 3. Trait Communication Table
    const feelingsArr = data.q2Feelings || [];
    const connectedArr = data.q4Connected || [];
    const { error: commErr } = await mergeAndUpsertTraitTable(supabase, 'trait_communication', userId, {
      conv_styles: feelingsArr.length > 0 ? feelingsArr : undefined,
      mediums: connectedArr.length > 0 ? connectedArr : undefined,
    });
    if (commErr) {
      return { success: false, error: `Failed to save communication traits: ${commErr.message}` };
    }

    // 4. Trait Personality Table (Extraversion from Q3 Energy slider)
    const hasEnergy = typeof data.q3Energy === 'number' && !isNaN(data.q3Energy);
    const extraversionVal = hasEnergy
      ? Math.round((1 - data.q3Energy!) * 1000) / 1000
      : null;
    const { error: persErr } = await mergeAndUpsertTraitTable(supabase, 'trait_personality', userId, {
      extraversion: extraversionVal,
    });
    if (persErr) {
      return { success: false, error: `Failed to save personality traits: ${persErr.message}` };
    }

    // 5. Trait Social Rhythm Table
    let rhythmVal: number | null = null;
    if (data.q5PlanningRhythm && data.q5PlanningRhythm.trim()) {
      const pText = data.q5PlanningRhythm.trim();
      if (pText.includes('Spontaneous')) {
        rhythmVal = 0.2;
      } else if (pText.includes('Flexible')) {
        rhythmVal = 0.5;
      } else if (pText.includes('In advance') || pText.includes('Planned') || pText.includes('ahead')) {
        rhythmVal = 0.8;
      }
    }

    const availArr = data.q5Availability || [];
    const { error: rhythmErr } = await mergeAndUpsertTraitTable(supabase, 'trait_social_rhythm', userId, {
      availability: availArr,
      planning_horizon: rhythmVal,
    });
    if (rhythmErr) {
      return { success: false, error: `Failed to save social rhythm traits: ${rhythmErr.message}` };
    }

    // 6. Trait Experience Table
    let groupSizeVal: number | null = null;
    if (data.q3GroupSize && data.q3GroupSize.trim()) {
      if (data.q3GroupSize === '1-on-1') {
        groupSizeVal = 0.0;
      } else if (data.q3GroupSize === '3-4 people') {
        groupSizeVal = 0.5;
      } else if (data.q3GroupSize === '5-6 people' || data.q3GroupSize === 'Big group') {
        groupSizeVal = 1.0;
      }
    }

    const outingsArr = data.q6Outings || [];
    const qualitiesArr = data.q8Qualities || [];
    const { error: expErr } = await mergeAndUpsertTraitTable(supabase, 'trait_experience', userId, {
      settings: outingsArr,
      group_size_pref: groupSizeVal,
      orientation: qualitiesArr,
    });
    if (expErr) {
      return { success: false, error: `Failed to save experience traits: ${expErr.message}` };
    }

    // 7. Trait Emotional Table
    let paceVal: number | null = null;
    if (data.q7EmotionalPacing && data.q7EmotionalPacing.trim()) {
      const paceText = data.q7EmotionalPacing.trim();
      if (paceText.includes('Fast')) {
        paceVal = 0.9;
      } else if (paceText.includes('Let it unfold')) {
        paceVal = 0.5;
      } else if (paceText.includes('Slow') || paceText.includes('Cautious')) {
        paceVal = 0.2;
      }
    }
    const { error: emoErr } = await mergeAndUpsertTraitTable(supabase, 'trait_emotional', userId, {
      er_opening_pace: paceVal,
    });
    if (emoErr) {
      return { success: false, error: `Failed to save emotional traits: ${emoErr.message}` };
    }

    // 8. Trait Geography Table
    const { error: geoErr } = await mergeAndUpsertTraitTable(supabase, 'trait_geography', userId, {
      home_area: data.homeArea.trim(),
    });
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

      // Single source of truth lookup map initialized from @soul-tribe/core
      const nameToIdMap = new Map<string, number>();

      for (const node of ONBOARDING_INTEREST_NODES) {
        nameToIdMap.set(node.name.trim().toLowerCase(), node.id);
      }

      // Override with DB nodes if present
      if (dbNodes) {
        for (const n of dbNodes) {
          nameToIdMap.set(n.name.trim().toLowerCase(), n.id);
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
    if (deepProfile.friendshipPillars || deepProfile.realFriendOpen) {
      await mergeAndUpsertTraitTable(supabase, 'trait_intent', userId, {
        intents: deepProfile.friendshipPillars ? [deepProfile.friendshipPillars] : (deepProfile.realFriendOpen ? ['friendship'] : undefined),
        depth: deepProfile.friendshipPillars ? 3 : (deepProfile.realFriendOpen ? 2 : undefined),
      });
    }

    // 3. Trait Communication (Section 2)
    const messagingVal = ANSWER_MAP.messagingStyle(deepProfile.messagingStyle);
    if (messagingVal || deepProfile.messagingStyleOpen) {
      await mergeAndUpsertTraitTable(supabase, 'trait_communication', userId, {
        contact_frequency_self: messagingVal?.contact_frequency_self,
        contact_frequency_expect: messagingVal?.contact_frequency_self,
        response_speed_self: messagingVal?.response_speed_self,
        response_speed_expect: messagingVal?.response_speed_self,
        message_length: messagingVal?.message_length,
        conv_styles: deepProfile.messagingStyleOpen ? [deepProfile.messagingStyleOpen] : undefined,
      });
    }

    // 4. Trait Personality (Section 5) — Omit invented defaults! Write ONLY derived values!
    const mbtiMap = ANSWER_MAP.mbti(deepProfile.mbti);
    const socialVibeVal = ANSWER_MAP.socialVibe(deepProfile.socialVibe);
    const saturdayVal = ANSWER_MAP.idealSaturday(deepProfile.idealSaturday);
    const tripVal = ANSWER_MAP.spontaneousTrip(deepProfile.spontaneousTrip);

    if (mbtiMap || socialVibeVal || saturdayVal || tripVal !== null || deepProfile.sunSign) {
      await mergeAndUpsertTraitTable(supabase, 'trait_personality', userId, {
        openness: mbtiMap?.openness,
        conscientiousness: mbtiMap?.conscientiousness,
        extraversion: mbtiMap?.extraversion,
        agreeableness: mbtiMap?.agreeableness,
        serious_playful: socialVibeVal?.serious_playful,
        intensity_easygoing: socialVibeVal?.intensity_easygoing,
        novelty_seeking: mbtiMap?.novelty_seeking ?? saturdayVal?.novelty ?? (tripVal !== null ? tripVal : undefined),
      });
    }

    // 5. Trait Social Rhythm (Section 4)
    if (saturdayVal || tripVal !== null) {
      await mergeAndUpsertTraitTable(supabase, 'trait_social_rhythm', userId, {
        planning_horizon: saturdayVal?.planning_horizon,
      });
    }

    // 6. Trait Emotional (Section 9)
    const supportVal = ANSWER_MAP.supportStyle(deepProfile.supportStyle);
    if (supportVal !== null || deepProfile.likeMeIfPrompt) {
      await mergeAndUpsertTraitTable(supabase, 'trait_emotional', userId, {
        advice_vs_listening_self: supportVal !== null ? supportVal : undefined,
        advice_vs_listening_expect: supportVal !== null ? supportVal : undefined,
      });
    }

    // 7. Trait Lifestyle & Experience (Sections 8 & 10)
    const groupSizeVal = ANSWER_MAP.groupSize(deepProfile.groupSize);
    if (groupSizeVal !== null || saturdayVal) {
      await mergeAndUpsertTraitTable(supabase, 'trait_experience', userId, {
        group_size_pref: groupSizeVal !== null ? groupSizeVal : undefined,
        novelty: saturdayVal?.novelty,
      });
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
