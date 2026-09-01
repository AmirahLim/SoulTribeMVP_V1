import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  score,
  softGate,
  generateMatchExplanation,
  getGenderAvatarForName,
} from '@soul-tribe/core';
import { toProfileVector } from '../../../lib/profileAdapter';

export const runtime = 'nodejs';

function getFitLabel(rankScore: number): string {
  if (rankScore >= 0.90) return 'Rare Resonance';
  if (rankScore >= 0.80) return 'Strong Resonance';
  if (rankScore >= 0.70) return 'Natural Resonance';
  if (rankScore >= 0.60) return 'Some Resonance';
  return '';
}

export async function POST(req: NextRequest) {
  // 1. Authenticate caller using Authorization header or session token
  const authHeader = req.headers.get('authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '').trim() : null;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !secretKey) {
    return NextResponse.json(
      { error: 'Server matching is unconfigured: SUPABASE_SECRET_KEY is required' },
      { status: 500 }
    );
  }

  let authUserId: string | null = null;

  if (token) {
    const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { data: { user }, error: authErr } = await authClient.auth.getUser(token);
    if (!authErr && user) {
      authUserId = user.id;
    }
  }

  if (!authUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Secret Key Client bypassing RLS (SERVER ONLY)
    const adminClient = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false },
    });

    const { data: dbProfiles, error: fetchErr } = await adminClient
      .from('profiles')
      .select(`
        *,
        trait_intent (*),
        trait_communication (*),
        trait_personality (*),
        trait_social_rhythm (*),
        trait_emotional (*),
        trait_experience (*),
        trait_lifestyle (*),
        trait_geography (*),
        user_interests (*, interest_nodes (name)),
        user_values (*)
      `);

    if (fetchErr) {
      console.error('[SoulTribe API] Database query error:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!dbProfiles || dbProfiles.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 3. Find viewer profile
    const viewerRow = dbProfiles.find((p) => p.id === authUserId);
    if (!viewerRow) {
      return NextResponse.json([], { status: 200 });
    }

    const viewerVec = toProfileVector(
      {
        displayName: viewerRow.display_name,
        homeArea: viewerRow.home_area || 'Singapore',
        avatarUrl: viewerRow.avatar_url,
        bio: viewerRow.bio,
        birthYear: viewerRow.birth_year,
        trait_intent: Array.isArray(viewerRow.trait_intent) ? viewerRow.trait_intent[0] : viewerRow.trait_intent,
        trait_communication: Array.isArray(viewerRow.trait_communication) ? viewerRow.trait_communication[0] : viewerRow.trait_communication,
        trait_personality: Array.isArray(viewerRow.trait_personality) ? viewerRow.trait_personality[0] : viewerRow.trait_personality,
        trait_social_rhythm: Array.isArray(viewerRow.trait_social_rhythm) ? viewerRow.trait_social_rhythm[0] : viewerRow.trait_social_rhythm,
        trait_emotional: Array.isArray(viewerRow.trait_emotional) ? viewerRow.trait_emotional[0] : viewerRow.trait_emotional,
        trait_experience: Array.isArray(viewerRow.trait_experience) ? viewerRow.trait_experience[0] : viewerRow.trait_experience,
        trait_lifestyle: Array.isArray(viewerRow.trait_lifestyle) ? viewerRow.trait_lifestyle[0] : viewerRow.trait_lifestyle,
        trait_geography: Array.isArray(viewerRow.trait_geography) ? viewerRow.trait_geography[0] : viewerRow.trait_geography,
        user_interests: viewerRow.user_interests || [],
        user_values: viewerRow.user_values || [],
      } as any,
      authUserId
    );

    // 4. Candidate Scoring & Explanation
    const candidates = dbProfiles.filter((p) => p.id !== authUserId);
    const rankedMatches = [];

    for (const candRow of candidates) {
      const intentRow = Array.isArray(candRow.trait_intent) ? candRow.trait_intent[0] : candRow.trait_intent;
      const commRow = Array.isArray(candRow.trait_communication) ? candRow.trait_communication[0] : candRow.trait_communication;
      const persRow = Array.isArray(candRow.trait_personality) ? candRow.trait_personality[0] : candRow.trait_personality;
      const rhythmRow = Array.isArray(candRow.trait_social_rhythm) ? candRow.trait_social_rhythm[0] : candRow.trait_social_rhythm;
      const emoRow = Array.isArray(candRow.trait_emotional) ? candRow.trait_emotional[0] : candRow.trait_emotional;
      const expRow = Array.isArray(candRow.trait_experience) ? candRow.trait_experience[0] : candRow.trait_experience;
      const lifeRow = Array.isArray(candRow.trait_lifestyle) ? candRow.trait_lifestyle[0] : candRow.trait_lifestyle;
      const geoRow = Array.isArray(candRow.trait_geography) ? candRow.trait_geography[0] : candRow.trait_geography;

      const candInterests = (candRow.user_interests || [])
        .map((i: any) => i.interest_nodes?.name || i.node_name || i.name)
        .filter(Boolean);

      const candValues = (candRow.user_values || [])
        .map((v: any) => v.value_key || v.value_name || v.name)
        .filter(Boolean);

      const candVec = toProfileVector(
        {
          displayName: candRow.display_name,
          homeArea: candRow.home_area || geoRow?.home_area || 'Singapore',
          avatarUrl: candRow.avatar_url,
          bio: candRow.bio,
          birthYear: candRow.birth_year,
          q1Finding: intentRow?.intents,
          q2Feelings: commRow?.conv_styles,
          q3Energy: persRow?.extraversion,
          q3GroupSize: expRow?.group_size_pref,
          q4Connected: commRow?.mediums,
          q5PlanningRhythm: rhythmRow?.planning_horizon,
          q5Availability: rhythmRow?.availability,
          q6Outings: candInterests,
          q7EmotionalPacing: emoRow?.er_opening_pace,
          q8Qualities: candValues,
          trait_intent: intentRow,
          trait_communication: commRow,
          trait_personality: persRow,
          trait_social_rhythm: rhythmRow,
          trait_emotional: emoRow,
          trait_experience: expRow,
          trait_lifestyle: lifeRow,
          trait_geography: geoRow,
          user_interests: candRow.user_interests || [],
          user_values: candRow.user_values || [],
        } as any,
        candRow.id
      );

      const matchRes = score(viewerVec, candVec);
      const softRes = softGate(matchRes, { provisionalFloor: 0.0 });
      if (!softRes.eligible) continue;

      const explanation = generateMatchExplanation(viewerVec, candVec);

      // SAFE DISCLOSURE: Return ONLY RankedMatch public fields
      rankedMatches.push({
        id: candRow.id,
        name: candRow.display_name || 'Member',
        avatarUrl: candRow.avatar_url || getGenderAvatarForName(candRow.display_name || 'Member'),
        homeArea: candRow.home_area || 'Singapore',
        bio: candRow.bio || 'Member in Singapore',
        rankScore: softRes.adjustedScore,
        resonance: matchRes.resonance,
        logistics: matchRes.logistics,
        clickText: explanation.click_text,
        rubText: explanation.friction_text,
        fitLabel: getFitLabel(softRes.adjustedScore),
        provisional: softRes.provisional,
        isDemo: false,
      });
    }

    rankedMatches.sort((a, b) => b.rankScore - a.rankScore);

    return NextResponse.json(rankedMatches, { status: 200 });
  } catch (err: any) {
    console.error('[SoulTribe API] Exception during match scoring:', err);
    return NextResponse.json({ error: err?.message || 'Failed to process matches' }, { status: 500 });
  }
}
