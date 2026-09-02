'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, AlertCircle, ChevronRight, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { Button } from '@soul-tribe/ui';
import { AuthGuard } from '../../../../components/AuthGuard';
import { getSupabaseBrowserClient, checkIsSupabaseConfigured } from '../../../../lib/supabase';
import { getUserProfile } from '../../../../lib/userStore';
import { getRankedMatches, RankedMatch, toProfileVector } from '../../../../lib/matching';
import { DEMO_PROFILES, score, softGate, generateMatchExplanation, nextBestQuestions, BASELINE_WEIGHTS } from '@soul-tribe/core';

interface DimensionReading {
  key: string;
  status: 'known' | 'unknown';
  alignment?: number;
  weight: number;
  phrase?: string;
}

interface BondData {
  overall: {
    rankScore: number;
    resonance: number;
    logistics: number;
    confidence: number;
    provisional: boolean;
  };
  dimensions: DimensionReading[];
  rubText: string;
  sharpen: Array<{ questionId: string; prompt: string; href: string }>;
}

const DIM_NAMES: Record<string, string> = {
  personality: 'Personality & Energy',
  communication: 'Communication Pace',
  intent: 'Friendship Intent',
  emotional: 'Emotional Opening',
  values: 'Core Character Values',
  interests: 'Shared Hobbies',
  social_rhythm: 'Social Rhythm & Schedule',
  lifestyle: 'Lifestyle & Setting',
  experience: 'Outing Preferences',
  geography: 'Neighbourhood Location',
};

const RESONANCE_KEYS = new Set(['personality', 'communication', 'intent', 'emotional', 'values', 'interests']);

export default function ViewBondPage() {
  return (
    <AuthGuard>
      <ViewBondContent />
    </AuthGuard>
  );
}

function ViewBondContent() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const personId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || '';
  const cleanPersonId = personId ? decodeURIComponent(personId).trim().toLowerCase() : '';

  const [bondData, setBondData] = useState<BondData | null>(null);
  const [personMatch, setPersonMatch] = useState<RankedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBond() {
      if (!cleanPersonId) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = getUserProfile();

        // 1. Try real backend API POST /api/bond if Supabase configured
        if (checkIsSupabaseConfigured()) {
          const client = getSupabaseBrowserClient();
          const { data: { session } } = await client.auth.getSession();
          if (session?.access_token) {
            const res = await fetch('/api/bond', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ candidateId: cleanPersonId }),
            });

            if (res.ok) {
              const data = await res.json();
              setBondData(data);

              // Also load match candidate info for header
              const matches = await getRankedMatches(userProfile, { limit: 40 });
              const found = matches.find((m) => m.id === cleanPersonId);
              if (found) setPersonMatch(found);

              setLoading(false);
              return;
            }
          }
        }

        // 2. Client-side local fallback computation (for demo profiles or offline local mode)
        const matches = await getRankedMatches(userProfile, { limit: 40 });
        const found = matches.find(
          (m) =>
            m.id.toLowerCase() === cleanPersonId ||
            m.name.toLowerCase().replace(/\s+/g, '') === cleanPersonId
        );

        if (found) {
          setPersonMatch(found);
          const viewerVec = toProfileVector(userProfile, userProfile.id || 'viewer-local');
          const candDemoVec = DEMO_PROFILES.find(
            (dp) =>
              dp.profile.id.toLowerCase() === cleanPersonId ||
              dp.profile.display_name.toLowerCase().replace(/\s+/g, '') === cleanPersonId
          );

          if (candDemoVec) {
            const matchRes = score(viewerVec, candDemoVec);
            const softRes = softGate(matchRes, { provisionalFloor: 0.0 });
            const explanation = generateMatchExplanation(viewerVec, candDemoVec);

            const isDimAnswered = (vec: any, k: string) => {
              if (k === 'interests' || k === 'values') return (vec[k]?.length ?? 0) > 0;
              return (vec[k]?.answered ?? 0) > 0;
            };

            const dimKeys = ['personality', 'communication', 'intent', 'emotional', 'values', 'interests', 'social_rhythm', 'lifestyle', 'experience', 'geography'];
            const dimensions: DimensionReading[] = dimKeys.map((key) => {
              const knownA = isDimAnswered(viewerVec, key);
              const knownB = isDimAnswered(candDemoVec, key);
              const isKnown = knownA && knownB;
              const weight = BASELINE_WEIGHTS[key as keyof typeof BASELINE_WEIGHTS] ?? 10;

              if (!isKnown) {
                return { key, status: 'unknown' as const, weight };
              }

              const alignment = matchRes.contributions[key] ?? 0.5;
              return {
                key,
                status: 'known' as const,
                alignment,
                weight,
                phrase: alignment >= 0.75 ? 'Strong alignment in this dimension.' : 'Balanced resonance in this dimension.',
              };
            });

            const nextQuestions = nextBestQuestions(viewerVec, 3);
            const sharpen = nextQuestions.map((qId) => ({
              questionId: qId,
              prompt: `Answer questions on ${DIM_NAMES[qId] || qId} to sharpen this bond reading`,
              href: '/you/deeper',
            }));

            setBondData({
              overall: {
                rankScore: softRes.adjustedScore,
                resonance: matchRes.resonance,
                logistics: matchRes.logistics,
                confidence: Math.min(viewerVec.profile.confidence, candDemoVec.profile.confidence),
                provisional: softRes.provisional,
              },
              dimensions,
              rubText: explanation.friction_text,
              sharpen,
            });
          }
        } else {
          setError('Match profile not found.');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load bond data.');
      } finally {
        setLoading(false);
      }
    }

    loadBond();
  }, [cleanPersonId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1D15] text-[#FFFDF9] flex flex-col items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        <p className="mt-4 text-[14px] text-white/80">Calculating Friendship DNA Bond...</p>
      </div>
    );
  }

  if (error || !bondData) {
    return (
      <div className="min-h-screen bg-[#0D1D15] text-[#FFFDF9] p-6 flex flex-col items-center justify-center">
        <AlertCircle className="h-10 w-10 text-amber-400 mb-3" />
        <p className="text-[15px] text-white/90 text-center">{error || 'Unable to calculate bond reading.'}</p>
        <Button variant="secondary" className="mt-6" onClick={() => router.back()}>
          ← Go Back
        </Button>
      </div>
    );
  }

  const resonanceDims = bondData.dimensions
    .filter((d) => RESONANCE_KEYS.has(d.key))
    .sort((a, b) => b.weight - a.weight);

  const logisticsDims = bondData.dimensions
    .filter((d) => !RESONANCE_KEYS.has(d.key))
    .sort((a, b) => b.weight - a.weight);

  const confidencePct = Math.round(bondData.overall.confidence * 100);

  return (
    <div className="relative min-h-screen w-full bg-[#0D1D15] text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND */}
      <img
        src="/user-artsy-1.jpg"
        alt="Bond Reading Canvas"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-30 pointer-events-none"
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center text-[13.5px] font-semibold text-white/80 hover:text-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Profile
        </button>

        {/* HEADER SUMMARY CARD */}
        <div className="rounded-[24px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
          <div className="flex items-center gap-4">
            {personMatch?.avatarUrl && (
              <img
                src={personMatch.avatarUrl}
                alt={personMatch.name}
                className="h-14 w-14 rounded-full object-cover border-2 border-white/30 shrink-0"
              />
            )}
            <div>
              <span className="text-[10.5px] font-bold tracking-widest text-amber-300 uppercase">
                Friendship DNA Bond Reading
              </span>
              <h1 className="text-[22px] font-extrabold text-white tracking-tight">
                You & {personMatch?.name || 'Member'}
              </h1>
              <p className="text-[12px] text-white/70 mt-0.5">
                Reading completeness: <strong className="text-white">{confidencePct}%</strong>
                {bondData.overall.provisional && ' (Provisional early read)'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-white/15">
            <div className="rounded-[16px] bg-white/10 p-3 text-center border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Resonance</span>
              <div className="mt-1 text-[20px] font-black text-emerald-300">
                {Math.round(bondData.overall.resonance * 100)}%
              </div>
            </div>
            <div className="rounded-[16px] bg-white/10 p-3 text-center border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Logistics</span>
              <div className="mt-1 text-[20px] font-black text-amber-300">
                {Math.round(bondData.overall.logistics * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* DIMENSION READINGS: RESONANCE (TRIBAL THREAD) */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-400" /> Your Tribal Thread with {personMatch?.name || 'Member'}
            </h3>
            <span className="text-[11px] font-medium text-white/60">Weighted share</span>
          </div>

          <div className="flex flex-col gap-3">
            {resonanceDims.map((dim) => (
              <DimensionRow key={dim.key} dim={dim} />
            ))}
          </div>
        </section>

        {/* DIMENSION READINGS: LOGISTICS */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-amber-400" /> Logistics & Rhythm Dimensions
            </h3>
            <span className="text-[11px] font-medium text-white/60">Weighted share</span>
          </div>

          <div className="flex flex-col gap-3">
            {logisticsDims.map((dim) => (
              <DimensionRow key={dim.key} dim={dim} />
            ))}
          </div>
        </section>

        {/* POTENTIAL FRICTION */}
        {bondData.rubText && (
          <section className="mt-6 rounded-[24px] border border-[#654422]/50 bg-[#2B1A17]/70 backdrop-blur-xl p-5 shadow-xl">
            <h3 className="text-[14px] font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-300 shrink-0" /> Potential Friction
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-amber-100/90 font-medium">
              {bondData.rubText}
            </p>
          </section>
        )}

        {/* SHARPEN THIS BOND ACTION LIST */}
        {bondData.sharpen && bondData.sharpen.length > 0 && (
          <section className="mt-6 rounded-[24px] border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-xl p-5 shadow-xl">
            <h3 className="text-[15px] font-extrabold text-emerald-300 tracking-tight flex items-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" /> Answer these 3 and this bond gets sharper
            </h3>
            <p className="mt-1 text-[12px] text-white/70">
              Filling in these under-answered areas improves precision for both of you.
            </p>

            <div className="mt-3.5 flex flex-col gap-2.5">
              {bondData.sharpen.map((item, idx) => (
                <Link
                  key={item.questionId || idx}
                  href={item.href}
                  className="flex items-center justify-between rounded-[16px] border border-white/20 bg-black/40 p-3 hover:bg-black/60 transition-all text-left"
                >
                  <div className="flex items-center gap-2.5 pr-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-300 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[13px] font-semibold text-white leading-snug">
                      {item.prompt}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/60 shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function DimensionRow({ dim }: { dim: DimensionReading }) {
  const isKnown = dim.status === 'known' && typeof dim.alignment === 'number';
  const alignmentPct = isKnown ? Math.round((dim.alignment as number) * 100) : 0;

  return (
    <div className="rounded-[18px] border border-white/15 bg-black/50 backdrop-blur-xl p-3.5 shadow-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-[13.5px] font-bold text-white">
          {DIM_NAMES[dim.key] || dim.key}
        </h4>
        <span className="text-[11px] font-semibold text-white/60">
          {dim.weight}% weight
        </span>
      </div>

      {isKnown ? (
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[12px] text-white/80 mb-1">
            <span className="font-medium text-white/90">{dim.phrase}</span>
            <span className="font-bold text-white">{alignmentPct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#164014] via-[#074710] to-[#654422] transition-all duration-500"
              style={{ width: `${alignmentPct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2 rounded-[12px] border border-dashed border-white/20 bg-white/5 px-3 py-2 text-[12px] text-white/60">
          <HelpCircle className="h-3.5 w-3.5 text-white/40 shrink-0" />
          <span>Not enough answers yet from one of you</span>
        </div>
      )}
    </div>
  );
}
