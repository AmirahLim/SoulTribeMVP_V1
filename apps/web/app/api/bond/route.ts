import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { toProfileVector } from '../../../lib/profileAdapter';
import {
  score,
  softGate,
  generateMatchExplanation,
  BASELINE_WEIGHTS,
  ProfileVector,
  getBondThreadPhrase,
  getHeadlineForAlignment,
  evaluateMechanism,
  calculateAsymmetricFit,
} from '@soul-tribe/core';
import type { ThreadKey } from '@soul-tribe/core';

export const runtime = 'nodejs';

function isThreadAnswered(vec: ProfileVector, key: string): boolean {
  if (!vec) return false;
  if (key === 'personality') return (vec.personality?.answered ?? 0) > 0;
  if (key === 'communication') return (vec.communication?.answered ?? 0) > 0;
  if (key === 'social_rhythm') return (vec.social_rhythm?.answered ?? 0) > 0;
  if (key === 'intent') return (vec.intent?.answered ?? 0) > 0;
  if (key === 'emotional') return (vec.emotional?.answered ?? 0) > 0;
  if (key === 'interests') return (vec.interests?.length ?? 0) > 0;
  if (key === 'values') return (vec.values?.length ?? 0) > 0;
  if (key === 'lifestyle') return (vec.lifestyle?.answered ?? 0) > 0;
  if (key === 'experience') return (vec.experience?.answered ?? 0) > 0;
  if (key === 'geography') return (vec.geography?.answered ?? 0) > 0;
  return false;
}

const QUESTION_MAP: Record<string, { prompt: string; href: string }> = {
  personality: { prompt: 'Share your social energy style and MBTI type', href: '/you/deeper?cat=1' },
  communication: { prompt: 'Clarify your preferred messaging mediums & reply pace', href: '/you/deeper?cat=2' },
  social_rhythm: { prompt: 'Set your weekend availability & planning rhythm', href: '/you/deeper?cat=3' },
  intent: { prompt: 'Specify what depth of friendship you are looking for', href: '/you/deeper?cat=4' },
  emotional: { prompt: 'Define your opening pace for personal conversations', href: '/you/deeper?cat=5' },
  interests: { prompt: 'Tag your favorite weekend activities & hobbies', href: '/onboarding' },
  values: { prompt: 'Pick the core character traits you value most in friends', href: '/onboarding' },
  lifestyle: { prompt: 'Add your coffee, dining, and weekend lifestyle habits', href: '/you/deeper?cat=6' },
  experience: { prompt: 'Share your preferred group size & outing vibe', href: '/you/deeper?cat=7' },
  geography: { prompt: 'Set your preferred Singapore neighbourhoods', href: '/profile' },
};

function adaptRowToUserData(row: any): any {
  return {
    displayName: row.display_name,
    homeArea: row.home_area || 'Singapore',
    avatarUrl: row.avatar_url,
    bio: row.bio,
    birthYear: row.birth_year,
    agePrefMin: row.age_pref_min,
    agePrefMax: row.age_pref_max,
    trait_intent: Array.isArray(row.trait_intent) ? row.trait_intent[0] : row.trait_intent,
    trait_communication: Array.isArray(row.trait_communication) ? row.trait_communication[0] : row.trait_communication,
    trait_personality: Array.isArray(row.trait_personality) ? row.trait_personality[0] : row.trait_personality,
    trait_social_rhythm: Array.isArray(row.trait_social_rhythm) ? row.trait_social_rhythm[0] : row.trait_social_rhythm,
    trait_emotional: Array.isArray(row.trait_emotional) ? row.trait_emotional[0] : row.trait_emotional,
    trait_experience: Array.isArray(row.trait_experience) ? row.trait_experience[0] : row.trait_experience,
    trait_lifestyle: Array.isArray(row.trait_lifestyle) ? row.trait_lifestyle[0] : row.trait_lifestyle,
    trait_geography: Array.isArray(row.trait_geography) ? row.trait_geography[0] : row.trait_geography,
    user_interests: row.user_interests || [],
    user_values: row.user_values || [],
  };
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : null;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'mock-pub-key';
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-secret-key';

  let authUserId: string | null = null;

  if (token) {
    const authClient = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false } });
    const { data: { user }, error } = await authClient.auth.getUser(token);
    if (!error && user) {
      authUserId = user.id;
    }
  }

  if (!authUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });

  // 2. Parse request body
  const body = await req.json().catch(() => ({}));
  const candidateId = body.candidateId;

  if (!candidateId || typeof candidateId !== 'string') {
    return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
  }

  // 3. Fetch profiles from database bypassing RLS
  const { data: dbProfiles, error: fetchErr } = await adminClient
    .from('profiles')
    .select(`
      id,
      display_name,
      avatar_url,
      home_area,
      bio,
      birth_year,
      age_pref_min,
      age_pref_max,
      status,
      is_demo,
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
    `)
    .in('id', [authUserId, candidateId]);

  if (fetchErr || !dbProfiles) {
    return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
  }

  const viewerRow = dbProfiles.find((p: any) => p.id === authUserId);
  const candRow = dbProfiles.find((p: any) => p.id === candidateId);

  if (!viewerRow || !candRow || (candRow as any).is_demo || candRow.id.startsWith('00000000-0000-0000-0000-')) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Build ProfileVectors
  const viewerVec = toProfileVector(adaptRowToUserData(viewerRow), authUserId);
  const candVec = toProfileVector(adaptRowToUserData(candRow), candidateId);

  const matchRes = score(viewerVec, candVec);
  const softRes = softGate(matchRes, { provisionalFloor: 0.0 });
  const explanation = generateMatchExplanation(viewerVec, candVec);
  const asymmetric = calculateAsymmetricFit(viewerVec, candVec, matchRes.resonance);

  const minConfidence = Math.min(viewerVec.profile.confidence, candVec.profile.confidence);

  const threadKeys = [
    'personality',
    'communication',
    'intent',
    'emotional',
    'values',
    'interests',
    'social_rhythm',
    'lifestyle',
    'experience',
    'geography',
  ];

  const threads = threadKeys.map((key) => {
    const isAnsweredA = isThreadAnswered(viewerVec, key);
    const isAnsweredB = isThreadAnswered(candVec, key);
    const isKnown = isAnsweredA && isAnsweredB;
    const weight = BASELINE_WEIGHTS[key as keyof typeof BASELINE_WEIGHTS] ?? 10;

    const contrib = matchRes.contributions[key];
    if (!isKnown || typeof contrib !== 'number') {
      return {
        key,
        status: 'unknown' as const,
        weight,
      };
    }

    const alignment = contrib;
    const mech = evaluateMechanism(key as ThreadKey, alignment, viewerVec, candVec);
    const headline = mech.outputState;
    const phrase = getBondThreadPhrase(key, viewerVec, candVec, alignment);

    return {
      key,
      status: 'known' as const,
      headline,
      alignment,
      weight,
      phrase,
      mechanism: mech.mechanism.toLowerCase() as 'alignment' | 'complementarity' | 'friction' | 'context',
      frictionClass: mech.severity || mech.frictionType,
      outputState: mech.outputState,
    };
  });

  const THREAD_LABELS: Record<string, string> = {
    personality: 'personality',
    communication: 'communication style',
    social_rhythm: 'social rhythm & availability',
    intent: 'friendship intent',
    emotional: 'emotional pacing',
    interests: 'interests & hobbies',
    values: 'core values',
    lifestyle: 'lifestyle habits',
    experience: 'outing preferences',
    geography: 'preferred neighbourhoods',
  };

  const viewerGaps: { questionId: string; prompt: string; href: string }[] = [];
  const candidateGaps: { questionId: string; prompt: string; href: string }[] = [];

  for (const key of threadKeys) {
    const viewerAns = isThreadAnswered(viewerVec, key);
    const candAns = isThreadAnswered(candVec, key);

    if (!viewerAns) {
      viewerGaps.push({
        questionId: key,
        prompt: QUESTION_MAP[key]?.prompt || `Answer questions on ${key} to refine match precision`,
        href: QUESTION_MAP[key]?.href || '/you/deeper',
      });
    } else if (!candAns) {
      const label = THREAD_LABELS[key] || key.replace('_', ' ');
      candidateGaps.push({
        questionId: key,
        prompt: `${candVec.profile.display_name} hasn't shared their ${label} yet — this part sharpens when they do.`,
        href: '',
      });
    }
  }

  const sharpen = [...viewerGaps.slice(0, 3)];
  if (sharpen.length < 3) {
    sharpen.push(...candidateGaps.slice(0, 3 - sharpen.length));
  }

  return NextResponse.json({
    overall: {
      rankScore: softRes.adjustedScore,
      resonance: matchRes.resonance,
      logistics: matchRes.logistics,
      confidence: minConfidence,
      provisional: softRes.provisional,
      fitAtoB: asymmetric.fitAtoB,
      fitBtoA: asymmetric.fitBtoA,
      imbalance: asymmetric.imbalance,
    },
    threads,
    rubText: explanation.friction_text,
    sharpen,
  });
}
