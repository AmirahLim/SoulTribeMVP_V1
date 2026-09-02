import { BASELINE_WEIGHTS, tuneWeights, recombine } from '../evaluation.ts';
import type { OutcomeSample, ThreadKey } from '../evaluation.ts';
import type { ProfileVector } from '../../domain/types.ts';

function createMockVector(id: string, name: string): ProfileVector {
  return {
    profile: {
      id,
      handle: name.toLowerCase(),
      display_name: name,
      home_area: 'Singapore',
      birth_year: 1995,
      age_pref_min: 18,
      age_pref_max: 99,
      profile_version: 1,
      confidence: 0.8,
      tier: 'free',
      status: 'active',
    },
    personality: { user_id: id, openness: Math.random(), conscientiousness: Math.random(), extraversion: Math.random(), agreeableness: Math.random(), emotional_stability: Math.random(), serious_playful: Math.random(), intensity_easygoing: Math.random(), assertive_accommodating: Math.random(), novelty_seeking: Math.random(), intellectual_curiosity: Math.random(), answered: 10 },
    communication: { user_id: id, contact_frequency_self: Math.random(), contact_frequency_expect: Math.random(), response_speed_self: Math.random(), response_speed_expect: Math.random(), initiation_self: Math.random(), initiation_expect: Math.random(), message_length: Math.random(), direct_diplomatic: Math.random(), high_context_literal: Math.random(), mediums: ['text'], conv_styles: ['deep'], answered: 10 },
    social_rhythm: { user_id: id, availability: ['sat_midday'], fri_night: true, sat_night: true, planning_horizon: Math.random(), social_freq_self: Math.random(), social_freq_expect: Math.random(), preferred_duration: 120, energy_peak: Math.random(), answered: 5 },
    intent: { user_id: id, intents: ['friendship'], depth: Math.floor(Math.random() * 4), open_to_hosting: false, answered: 3 },
    emotional: { user_id: id, er_opening_pace: Math.random(), er_cadence_need: Math.random(), er_cadence_expect: Math.random(), er_reassurance_need: Math.random(), er_reassurance_offer: Math.random(), er_recovery_time: Math.random(), er_conflict_approach: Math.random(), expressiveness: Math.random(), vulnerability_comfort: Math.random(), affection: Math.random(), advice_vs_listening_self: Math.random(), advice_vs_listening_expect: Math.random(), reliability_self: Math.random(), reliability_expect: Math.random(), boundary_clarity: Math.random(), answered: 10 },
    values: [],
    interests: [],
    lifestyle: { user_id: id, budget_band: 2, alcohol: 'occasional', smoking: 'none', activity_level: Math.random(), travel_frequency: Math.random(), life_stage: 'working', work_schedule: [], food_prefs: [], pets: [], accessibility_needs: [], dealbreakers: [], answered: 5 },
    experience: { user_id: id, settings: ['cafe'], group_size_pref: Math.random(), orientation: ['conversation'], novelty: Math.random(), answered: 5 },
    geography: { user_id: id, home_area: 'Singapore', radius_minutes: { coffee: 30 }, answered: 2 },
  };
}

function runTuningTool() {
  console.log('===============================================================');
  console.log('      SOUL TRIBE MATCHING ENGINE — WEIGHT TUNING HARNESS      ');
  console.log('===============================================================');
  console.log('[INFO] Generating synthetic outcome samples...');
  console.log('[NOTE] This synthetic run proves optimization harness mechanics.');
  console.log('       It is NOT evidence of real user match quality.\n');

  const pool = Array.from({ length: 60 }, (_, i) => createMockVector(`usr_${i}`, `User ${i}`));
  const samples: OutcomeSample[] = [];

  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const vecA = pool[i];
      const vecB = pool[j];

      // Simulated thread scores
      const dims: Record<ThreadKey, number> = {
        personality: Math.abs(vecA.personality.openness - vecB.personality.openness),
        communication: Math.abs(vecA.communication.contact_frequency_self - vecB.communication.contact_frequency_self),
        social_rhythm: Math.abs(vecA.social_rhythm.planning_horizon - vecB.social_rhythm.planning_horizon),
        intent: vecA.intent.depth === vecB.intent.depth ? 0.9 : 0.4,
        emotional: Math.abs(vecA.emotional.er_opening_pace - vecB.emotional.er_opening_pace),
        interests: 0.7,
        values: 0.8,
        lifestyle: 0.75,
        experience: 0.6,
        geography: 0.9,
      };

      const baseRank = recombine(dims, BASELINE_WEIGHTS).rank;
      const noise = (Math.random() - 0.5) * 0.1;
      const outcome = Math.max(0, Math.min(1, baseRank + noise));

      samples.push({
        userA: vecA.profile.id,
        userB: vecB.profile.id,
        dims,
        outcome,
      });
    }
  }

  console.log(`[INFO] Created ${samples.length} synthetic outcome samples.`);
  const tuningResult = tuneWeights(samples, BASELINE_WEIGHTS, { iterations: 20, seed: 123 });

  console.log('\n--- WEIGHT COMPARISON TABLE ---');
  console.log('Thread           | Baseline Weight | Tuned Weight');
  console.log('--------------------------------------------------');
  for (const k of Object.keys(BASELINE_WEIGHTS) as ThreadKey[]) {
    const baseW = BASELINE_WEIGHTS[k].toFixed(1).padStart(15);
    const tunedW = tuningResult.weights[k].toFixed(1).padStart(12);
    console.log(`${k.padEnd(16)} | ${baseW} | ${tunedW}`);
  }

  console.log('\n--- METRICS SUMMARY ---');
  console.log(`Test Spearman (Baseline): ${tuningResult.baselineMetrics.spearman.toFixed(4)}`);
  console.log(`Test Spearman (Tuned)   : ${tuningResult.testMetrics.spearman.toFixed(4)}`);
  console.log(`Test Pearson            : ${tuningResult.testMetrics.pearson.toFixed(4)}`);
  console.log(`Test AUC                : ${tuningResult.testMetrics.auc.toFixed(4)}`);
  console.log(`Improved                : ${tuningResult.improved}`);
  if (tuningResult.warning) {
    console.log(`Warning                 : ${tuningResult.warning}`);
  }
}

runTuningTool();
