import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  score,
  softGate,
  generateMatchExplanation,
  getGenderAvatarForName,
  buildMatchSurfacedEvent,
  recordEvent,
} from '@soul-tribe/core';
import type { MatchContext } from '@soul-tribe/core';
import { reflectionBoost, REFLECTION_RANKING_VERSION } from '../../../lib/reflectionRanking';
import { adaptRowToUserData } from '../../../lib/profileRowAdapter';
import { toProfileVector } from '../../../lib/profileAdapter';

export const runtime = 'nodejs';

function getFitLabel(
  rankScore: number,
  isProvisional?: boolean,
  minConfidence?: number
): string {
  if (isProvisional || (minConfidence !== undefined && minConfidence < 0.55)) {
    if (rankScore >= 0.60) return 'Early Read';
    if (rankScore >= 0.40) return 'Worth a Look';
    return '';
  }
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
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missingEnv: string[] = [];
  if (!supabaseUrl) missingEnv.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!publishableKey) missingEnv.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  if (!secretKey) missingEnv.push('SUPABASE_SECRET_KEY');

  if (missingEnv.length > 0 || !supabaseUrl || !publishableKey || !secretKey) {
    return NextResponse.json(
      { error: `Server matching is unconfigured: missing ${missingEnv.join(', ')}` },
      { status: 500 }
    );
  }

  let authUserId: string | null = null;

  if (token) {
    const authClient = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false } });
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

    // Part 3: Load viewer's blocks and reports in both directions
    const { data: blocks, error: blockErr } = await adminClient
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${authUserId},blocked_id.eq.${authUserId}`);

    const { data: reports, error: reportErr } = await adminClient
      .from('reports')
      .select('reporter_id, reported_id')
      .or(`reporter_id.eq.${authUserId},reported_id.eq.${authUserId}`);

    if (blockErr || reportErr) {
      console.error('[SoulTribe API] Failed to load blocks/reports:', blockErr || reportErr);
      return NextResponse.json({ error: 'Failed to verify safety blocks' }, { status: 500 });
    }

    // Part 4.2: Cap to 200 profiles and select specific columns
    const profileSelection = `
        id,
        display_name,
        avatar_url,
        home_area,
        bio,
        birth_year,
        age_pref_min,
        age_pref_max,
        status,
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
      `;
    const { data: dbProfiles, error: fetchErr } = await adminClient
      .from('profiles')
      .select(profileSelection)
      .eq('status', 'active')
      .limit(200);

    if (fetchErr) {
      console.error('[SoulTribe API] Database query error:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!dbProfiles || dbProfiles.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Exclude demo candidates server side
    const nonDemoProfiles = dbProfiles.filter(
      (p: any) => !p.id.startsWith('00000000-0000-0000-0000-')
    );

    const blockedUserIds = (blocks || []).map((b: any) =>
      b.blocker_id === authUserId ? b.blocked_id : b.blocker_id
    );
    const reportedUserIds = (reports || []).map((r: any) =>
      r.reporter_id === authUserId ? r.reported_id : r.reporter_id
    );

    const candidatesPool = nonDemoProfiles.filter((p) => p.id !== authUserId);

    const body = await req.json().catch(() => ({}));
    const allowedCategories = ['coffee', 'dining', 'active', 'cultural', 'nightlife', 'creative', 'intellectual'];
    if (body.activityCategory && !allowedCategories.includes(body.activityCategory)) return NextResponse.json({ error: 'Unknown activity category' }, { status: 400 });
    const context: MatchContext = {
      activity_category: body.activityCategory,
      blockedUserIds,
      reportedUserIds,
      candidatePoolSize: candidatesPool.length,
    };

    // 3. Find viewer profile
    const { data: viewerRow, error: viewerError } = await adminClient.from('profiles').select(profileSelection).eq('id', authUserId).eq('status', 'active').maybeSingle();
    if (viewerError) return NextResponse.json({ error: 'Unable to load your profile' }, { status: 503 });
    if (!viewerRow) {
      return NextResponse.json([], { status: 200 });
    }

    const viewerVec = toProfileVector(adaptRowToUserData(viewerRow), authUserId);

    const { data: learningPreference, error: preferenceError } = await adminClient
      .from('recommendation_preferences')
      .select('use_reflections')
      .eq('user_id', authUserId)
      .maybeSingle();
    if (preferenceError) {
      console.error('[SoulTribe API] recommendation_preferences query failed:', {
        code: preferenceError.code,
        message: preferenceError.message,
      });
      return NextResponse.json({ error: preferenceError.message }, { status: 500 });
    }

    let ownReflections: Array<{ about_id: string; would_meet_again: boolean }> = [];
    if (learningPreference?.use_reflections) {
      const { data, error } = await adminClient
        .from('rhythm_checks')
        .select('about_id,would_meet_again')
        .eq('author_id', authUserId)
        .limit(200);
      if (error) {
        console.error('[SoulTribe API] rhythm_checks query failed:', {
          code: error.code,
          message: error.message,
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      ownReflections = data || [];
    }
    // 4. Candidate Scoring & Explanation
    const candidates = candidatesPool;
    const rankedMatches = [];
    const candidateVecMap = new Map();
    const matchResMap = new Map();

    for (const candRow of candidates) {
      const candVec = toProfileVector(adaptRowToUserData(candRow), candRow.id);

      const matchRes = score(viewerVec, candVec, context);
      const softRes = softGate(matchRes, { provisionalFloor: 0.0 });
      if (!softRes.eligible) continue;

      const explanation = generateMatchExplanation({ ...viewerVec, values: viewerVec.values?.filter(v => v.visibility === 'public') }, { ...candVec, values: candVec.values?.filter(v => v.visibility === 'public') });

      candidateVecMap.set(candRow.id, candVec);
      matchResMap.set(candRow.id, matchRes);

      // SAFE DISCLOSURE: Return ONLY RankedMatch public fields
      rankedMatches.push({
        id: candRow.id,
        name: candRow.display_name || 'Member',
        avatarUrl: candRow.avatar_url || getGenderAvatarForName(candRow.display_name || 'Member'),
        homeArea: candRow.home_area || 'Singapore',
        bio: candRow.bio || 'Member in Singapore',
        rankScore: Math.min(1, softRes.adjustedScore + reflectionBoost(Boolean(learningPreference?.use_reflections), candRow.id, ownReflections)),
        resonance: matchRes.resonance,
        logistics: matchRes.logistics,
        clickText: explanation.click_text,
        rubText: explanation.friction_text,
        fitLabel: getFitLabel(softRes.adjustedScore, softRes.provisional, Math.min(viewerVec.profile.confidence, candVec.profile.confidence)),
        provisional: softRes.provisional,
        isDemo: false,
      });
    }

    rankedMatches.sort((a, b) => b.rankScore - a.rankScore);

    // Part 1.5: Emit match surfaced events on server for real candidates
    let positionCounter = 1;
    for (const item of rankedMatches) {
      const candVec = candidateVecMap.get(item.id);
      const matchRes = matchResMap.get(item.id);
      if (candVec && matchRes) {
        const surfacedEvent = buildMatchSurfacedEvent(
          viewerVec,
          candVec,
          matchRes,
          positionCounter++,
          context,
          item.provisional
        );
        recordEvent(surfacedEvent);
      }
    }

    // Aggregate audit keeps private feedback out of client-visible text.
    await adminClient.from('interaction_events').insert({ actor_id: authUserId, event_type: 'recommendations_generated', engine_version: REFLECTION_RANKING_VERSION,
      payload: { count: rankedMatches.length, reflections_enabled: Boolean(learningPreference?.use_reflections) } });
    return NextResponse.json(rankedMatches, { status: 200 });
  } catch (err: any) {
    console.error('[SoulTribe API] Exception during match scoring:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
