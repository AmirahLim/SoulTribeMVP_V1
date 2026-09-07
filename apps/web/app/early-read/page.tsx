"use client";
import ProfilePhoto from './ProfilePhoto';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/authContext";
import { getUserProfile } from "../../lib/userStore";
import { hydrateProfile } from "../../lib/profileHydration";
import {
  BaselineDraft,
  completeDraft,
  isDraft,
  selectedLabels,
  groupChoices,
} from "../../lib/sixQuestionOnboarding";
import "../onboarding/onboarding.css";
export default function EarlyRead() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [draft, setDraft] = useState<BaselineDraft | null>(null);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/join");
      return;
    }
    const profile = getUserProfile() as ReturnType<typeof getUserProfile> & {
      baselineV2?: BaselineDraft;
    };
    if (profile.hasCompletedOnboarding) {
      if (isDraft(profile.baselineV2)) {
        setDraft(profile.baselineV2);
        setSaved(true);
      } else router.replace("/you");
      return;
    }
    fetch("/api/onboarding/draft")
      .then((r) => r.json())
      .then((data) => {
        if (isDraft(data.draft) && completeDraft(data.draft))
          setDraft(data.draft);
        else
          setError(
            "Return to the browser where you answered the six questions, or start again.",
          );
      })
      .catch(() => setError("Unable to load your answers. Please reload."));
  }, [user, loading, router]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/onboarding/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: name.trim(),
          birthYear: Number(year),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      await hydrateProfile(user.id);
      setDraft(data.draft);
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="ob-shell">
      <section className="ob-read">
        {!saved ? (
          <>
            <p className="ob-eyebrow">YOUR ACCOUNT DETAILS</p>
            <h1>A name to say hello to.</h1>
            <p>
              Your answers are ready. Add your display name to finish your profile.
            </p>
            <form className="ob-fields" onSubmit={save}>
              <label htmlFor="name">Display name</label>
              <input
                id="name"
                required
                maxLength={80}
                autoComplete="nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label htmlFor="year">Birth year</label>
              <input
                id="year"
                required
                type="number"
                min={1930}
                max={new Date().getFullYear() - 18}
                autoComplete="bday-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
              <p>Soul Tribe is for adults aged 18 and over.</p>
              <button className="ob-primary" disabled={!draft || busy}>
                {busy ? "Saving…" : "Reveal my Early Read →"}
              </button>
            </form>
            <Link href="/onboarding">Edit my handle or answers</Link>
          </>
        ) : (
          draft && (
            <>
              <p className="ob-eyebrow">YOUR EARLY READ</p>
              <h1>A little more you.</h1>
              {user && <ProfilePhoto userId={user.id} />}
              <div
                className="ob-bloom"
                aria-label="Six answered areas form your first social signature"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <i key={n} />
                ))}
              </div>
              <p>
                Your early answers suggest you enjoy{" "}
                <strong>{groupChoices(draft).join(' or ').toLowerCase()}</strong> settings. You’re
                making room for{" "}
                <strong>{selectedLabels(draft.intent,draft.intentOther).join(", ").toLowerCase()}</strong>.
              </p>
              {!!draft.desiredQualities?.length && <><h2>You value in a friend</h2><p>{selectedLabels(draft.desiredQualities,draft.qualityOther).join(' · ')}</p><p>We’ll only describe someone as bringing these qualities when their own measured answers support it. Until then, that part is not yet measured.</p></>}
              <h2>You click through</h2>
              <p>{selectedLabels(draft.clicks,draft.clicksOther).join(" · ")}</p>
              {draft.flowVersion === 3 && <><h2>Your social rhythm</h2><p>{[draft.connectionChoice === 'Other' ? draft.connectionOther : draft.connectionChoice, draft.planningChoice === 'Other' ? draft.planningOther : draft.planningChoice, draft.punctualityChoice === 'Other' ? draft.punctualityOther : draft.punctualityChoice].filter(Boolean).join(' · ')}</p></>}
              <h2>You’d say yes to</h2>
              <p>{selectedLabels(draft.outings,draft.outingOther).join(" · ")}</p>
              <h2>Room to get to know you</h2>
              <p>
                This is an Early Read. Communication habits, values and handling
                differences take more than six questions. Deepen your Tribal
                Pass whenever you’re ready.
              </p>
              <Link className="ob-primary" href="/people">
                See who I might click with →
              </Link>
              <Link href="/you">My Social Signature</Link>
              <Link href="/you/deeper">Deepen my Tribal Pass</Link>
            </>
          )
        )}
        {error && (
          <p role="alert" className="ob-error">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
