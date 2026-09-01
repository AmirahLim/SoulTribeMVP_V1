'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { IllustratedGround, Button, Chip } from '@soul-tribe/ui';
import { Check, ArrowLeft, Lock, ShieldCheck, Sparkles, UserCheck, CheckCircle2, FastForward } from 'lucide-react';
import { useAuth } from '../../../../lib/authContext';
import { getUserProfile } from '../../../../lib/userStore';
import { saveRhythmCheck, saveOutingRecord, RhythmCheckInput } from '../../../../lib/rhythmChecks';
import { AuthGuard } from '../../../../components/AuthGuard';

export default function OutingRecordPage() {
  return (
    <AuthGuard>
      <OutingRecordContent />
    </AuthGuard>
  );
}

interface Attendee {
  id: string;
  name: string;
  avatarUrl: string;
  isHost?: boolean;
}

function OutingRecordContent() {
  const router = useRouter();
  const params = useParams();
  const outingId = (params?.id as string) || 'out-pottery-01';

  const { user: authUser } = useAuth();
  const profile = getUserProfile();
  const authorId = profile.id || authUser?.id || '00000000-0000-0000-0000-000000000099';

  // State
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Default attendees for demo / fallback outing
  const [attendees] = useState<Attendee[]>([
    { id: 'm1', name: 'Marcus Tan', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80', isHost: true },
    { id: 'r2', name: 'Chen Wei', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
    { id: 'r3', name: 'Sarah Chen', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
    { id: 'r4', name: 'Daniel K.', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  ]);

  // Attendance state (who actually turned up)
  const [attendedIds, setAttendedIds] = useState<string[]>(['m1', 'r2', 'r3', 'r4']);
  const [headline, setHeadline] = useState(
    'Discovered the quiet courtyard behind the vintage shop and agreed 4 people is the ideal group size.'
  );

  // Per-attendee feedback state
  const [feedbackState, setFeedbackState] = useState<
    Record<
      string,
      {
        wouldMeetAgain: number;
        energyRead: 'quieter' | 'as_expected' | 'livelier';
        paceRead: 'slower' | 'as_expected' | 'faster';
        note: string;
        status: 'pending' | 'saved' | 'skipped';
      }
    >
  >({
    m1: { wouldMeetAgain: 5, energyRead: 'as_expected', paceRead: 'as_expected', note: '', status: 'pending' },
    r2: { wouldMeetAgain: 4, energyRead: 'as_expected', paceRead: 'as_expected', note: '', status: 'pending' },
    r3: { wouldMeetAgain: 5, energyRead: 'livelier', paceRead: 'as_expected', note: '', status: 'pending' },
    r4: { wouldMeetAgain: 4, energyRead: 'as_expected', paceRead: 'as_expected', note: '', status: 'pending' },
  });

  const toggleAttended = (id: string) => {
    setAttendedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const updateFeedback = (aboutId: string, updates: Partial<(typeof feedbackState)[string]>) => {
    setFeedbackState((prev) => ({
      ...prev,
      [aboutId]: { ...prev[aboutId], ...updates },
    }));
  };

  const handleSaveIndividualFeedback = async (aboutId: string) => {
    const item = feedbackState[aboutId];
    if (!item) return;

    const payload: RhythmCheckInput = {
      outing_id: outingId,
      author_id: authorId,
      about_id: aboutId,
      would_meet_again: item.wouldMeetAgain,
      energy_read: item.energyRead,
      pace_read: item.paceRead,
      note: item.note.trim() || null,
    };

    const res = await saveRhythmCheck(payload);
    if (res.success) {
      updateFeedback(aboutId, { status: 'saved' });
    } else {
      setErrorMessage(res.error || 'Failed to save feedback');
    }
  };

  const handleSkipIndividual = (aboutId: string) => {
    updateFeedback(aboutId, { status: 'skipped' });
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Save outing record (headline + attended list)
      const recordRes = await saveOutingRecord({
        outing_id: outingId,
        headline: headline.trim() || null,
        attended: attendedIds,
      });

      if (!recordRes.success) {
        setErrorMessage(recordRes.error || 'Failed to save outing record');
        setIsSubmitting(false);
        return;
      }

      // 2. Save rhythm checks for all attended members (except author) that are pending or saved
      const targetPeers = attendees.filter(
        (a) => a.id !== authorId && attendedIds.includes(a.id)
      );

      for (const peer of targetPeers) {
        const item = feedbackState[peer.id];
        if (item && item.status !== 'skipped') {
          await saveRhythmCheck({
            outing_id: outingId,
            author_id: authorId,
            about_id: peer.id,
            would_meet_again: item.wouldMeetAgain,
            energy_read: item.energyRead,
            pace_read: item.paceRead,
            note: item.note.trim() || null,
          });
        }
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error saving post-outing record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Other attendees who actually turned up (and are not the author)
  const peerAttendees = attendees.filter(
    (a) => a.id !== authorId && attendedIds.includes(a.id)
  );

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center text-[13.5px] font-semibold text-[#A6AAA4] hover:text-[#F3F0E9]"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </button>

      {!submitted ? (
        <form onSubmit={handleSubmitAll} className="flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              24-Hour Post-Outing Artifact
            </span>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#F3F0E9]">
              Rhythm Check & Record
            </h1>
            <p className="mt-1 text-[14px] text-[#A6AAA4]">
              Saturday Pottery & Filter Coffee · 14 Sep
            </p>
          </div>

          {/* PRIVACY GUARANTEE BANNER */}
          <div className="rounded-[20px] border border-amber-400/30 bg-amber-500/10 p-4 backdrop-blur-md flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13.5px] font-bold text-amber-200 uppercase tracking-wider">
                🔒 Private & Confidential Feedback
              </h4>
              <p className="mt-1 text-[12.5px] text-[#F3F0E9]/90 leading-relaxed">
                Your Rhythm Check feedback is strictly private and used exclusively by the algorithm to calibrate future matching weights. The people rated will <strong>never</strong> see your responses.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-[16px] border border-red-500/30 bg-red-500/10 p-3.5 text-[13px] font-semibold text-red-200">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: ATTENDANCE TRACKER */}
          <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg space-y-4">
            <div>
              <span className="text-[10.5px] font-bold tracking-widest text-[#8F998D] uppercase">
                Step 1 of 3
              </span>
              <h3 className="text-[18px] font-bold text-[#F3F0E9] flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-amber-300" /> Who actually attended?
              </h3>
              <p className="text-[12.5px] text-[#A6AAA4]">
                Confirm who turned up so we can write real attendance records (`outing_records.attended`).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {attendees.map((person) => {
                const isAttended = attendedIds.includes(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => toggleAttended(person.id)}
                    className={`flex items-center justify-between rounded-[16px] border p-3 transition-all ${
                      isAttended
                        ? 'border-emerald-400/40 bg-emerald-500/15 text-white'
                        : 'border-[#F3F0E9]/15 bg-[#0D1D15] text-[#A6AAA4] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={person.avatarUrl}
                        alt={person.name}
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20"
                      />
                      <div className="text-left">
                        <span className="text-[13.5px] font-bold text-[#F3F0E9] block">
                          {person.name} {person.isHost && <span className="text-[10px] text-amber-300 font-extrabold uppercase">(Host)</span>}
                        </span>
                        <span className="text-[11px] text-[#A6AAA4]">
                          {isAttended ? 'Attended ✓' : 'Did not attend'}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        isAttended
                          ? 'border-emerald-400 bg-emerald-400 text-black'
                          : 'border-[#F3F0E9]/30 bg-transparent'
                      }`}
                    >
                      {isAttended && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: PER-ATTENDEE PRIVATE RHYTHM CHECKS */}
          <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg space-y-5">
            <div>
              <span className="text-[10.5px] font-bold tracking-widest text-[#8F998D] uppercase">
                Step 2 of 3
              </span>
              <h3 className="text-[18px] font-bold text-[#F3F0E9] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-300" /> Private Rhythm Check
              </h3>
              <p className="text-[12.5px] text-[#A6AAA4]">
                One screen per attendee, 3 quick answers. You may skip anyone.
              </p>
            </div>

            {peerAttendees.length === 0 ? (
              <p className="text-[13px] text-[#A6AAA4] italic">
                No other attendees marked as attended.
              </p>
            ) : (
              peerAttendees.map((person) => {
                const fb = feedbackState[person.id] || {
                  wouldMeetAgain: 5,
                  energyRead: 'as_expected',
                  paceRead: 'as_expected',
                  note: '',
                  status: 'pending',
                };

                return (
                  <div
                    key={person.id}
                    className="rounded-[20px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-4.5 space-y-4 shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={person.avatarUrl}
                          alt={person.name}
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-white/30"
                        />
                        <div>
                          <h4 className="text-[15px] font-extrabold text-[#F3F0E9]">
                            {person.name}
                          </h4>
                          <span className="text-[11.5px] text-[#A6AAA4]">
                            Private peer feedback
                          </span>
                        </div>
                      </div>

                      {fb.status === 'saved' && (
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Saved
                        </span>
                      )}

                      {fb.status === 'skipped' && (
                        <span className="rounded-full bg-white/10 border border-white/20 px-2.5 py-1 text-[11px] font-bold text-white/70">
                          Skipped
                        </span>
                      )}
                    </div>

                    {fb.status !== 'skipped' && (
                      <div className="space-y-4 pt-1">
                        {/* Q1: Would meet again (1-5) */}
                        <div>
                          <label className="text-[12.5px] font-semibold text-[#F3F0E9] block mb-2">
                            Would meet {person.name} again: <strong className="text-amber-300">{fb.wouldMeetAgain} / 5</strong>
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => updateFeedback(person.id, { wouldMeetAgain: val, status: 'pending' })}
                                className={`flex h-9 w-9 items-center justify-center rounded-[10px] text-[13.5px] font-bold transition-all ${
                                  fb.wouldMeetAgain === val
                                    ? 'bg-amber-400 text-black shadow-md'
                                    : 'border border-[#F3F0E9]/15 bg-[#15261C] text-[#F3F0E9] hover:bg-[#1f3729]'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Q2: Social energy read */}
                        <div>
                          <label className="text-[12.5px] font-semibold text-[#F3F0E9] block mb-2">
                            Social energy read:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { id: 'quieter', label: 'Quieter than expected' },
                              { id: 'as_expected', label: 'As expected' },
                              { id: 'livelier', label: 'Livelier than expected' },
                            ].map((opt) => (
                              <Chip
                                key={opt.id}
                                label={opt.label}
                                selected={fb.energyRead === opt.id}
                                onClick={() => updateFeedback(person.id, { energyRead: opt.id as any, status: 'pending' })}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Q3: Pace read */}
                        <div>
                          <label className="text-[12.5px] font-semibold text-[#F3F0E9] block mb-2">
                            Conversation pace read:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { id: 'slower', label: 'Slower pace' },
                              { id: 'as_expected', label: 'Balanced' },
                              { id: 'faster', label: 'Faster pace' },
                            ].map((opt) => (
                              <Chip
                                key={opt.id}
                                label={opt.label}
                                selected={fb.paceRead === opt.id}
                                onClick={() => updateFeedback(person.id, { paceRead: opt.id as any, status: 'pending' })}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Optional private note */}
                        <div>
                          <label className="text-[12px] font-semibold text-[#A6AAA4] block mb-1">
                            Optional private note for matching calibration:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Easy conversation, great listener..."
                            value={fb.note}
                            onChange={(e) => updateFeedback(person.id, { note: e.target.value, status: 'pending' })}
                            className="w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#15261C] px-3 py-2 text-[13px] text-[#F3F0E9] outline-none"
                          />
                        </div>

                        {/* Card actions */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={() => handleSkipIndividual(person.id)}
                            className="text-[12px] font-semibold text-[#A6AAA4] hover:text-white flex items-center gap-1"
                          >
                            <FastForward className="h-3.5 w-3.5" /> Skip this person
                          </button>

                          <Button
                            type="button"
                            variant={fb.status === 'saved' ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => handleSaveIndividualFeedback(person.id)}
                          >
                            {fb.status === 'saved' ? 'Saved ✓' : 'Save Feedback'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* STEP 3: OUTING RECORD HEADLINE */}
          <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg space-y-3">
            <div>
              <span className="text-[10.5px] font-bold tracking-widest text-[#8F998D] uppercase">
                Step 3 of 3
              </span>
              <h3 className="text-[18px] font-bold text-[#F3F0E9]">
                Outing Record Headline
              </h3>
              <p className="text-[12.5px] text-[#A6AAA4]">
                One memory or highlight to record on the Tribe's Outing Timeline.
              </p>
            </div>

            <textarea
              rows={3}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full rounded-[14px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3.5 text-[13.5px] text-[#F3F0E9] outline-none leading-relaxed"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Record & Feedback...' : 'Complete Post-Outing Record →'}
          </Button>
        </form>
      ) : (
        /* SUCCESS STATE */
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-emerald-400/30 bg-[#15261C] p-8 text-center shadow-2xl space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-black shadow-lg">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>

          <h2 className="text-[26px] font-extrabold text-[#F3F0E9]">
            Record & Feedback Saved!
          </h2>

          <p className="text-[14px] text-[#A6AAA4] max-w-[340px] leading-relaxed">
            Your private Rhythm Checks have recalibrated future matching weights, and actual attendance (`outing_records.attended`) has been recorded.
          </p>

          <div className="rounded-[16px] border border-white/10 bg-black/40 p-3.5 text-[12.5px] text-amber-300 font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>All peer feedback is strictly private & author-only.</span>
          </div>

          <Button variant="primary" size="md" className="mt-4" onClick={() => router.push('/timeline')}>
            View Tribe's Timeline →
          </Button>
        </div>
      )}
    </IllustratedGround>
  );
}
