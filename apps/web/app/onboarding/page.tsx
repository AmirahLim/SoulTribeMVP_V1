"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/authContext";
import { getUserProfile } from "../../lib/userStore";
import {
  AREAS,
  CLICKS,
  FLOW,
  GROUPS,
  INTENTS,
  OUTINGS,
  TRAVEL,
  BaselineDraft,
  emptyDraft,
  isDraft,
  microInsight,
  validStep,
} from "../../lib/baselineOnboarding";
import "./onboarding.css";
const titles = [
  "What are you looking for right now?",
  "When do you know you’re clicking?",
  "What’s your social sweet spot?",
  "How do your friendships flow?",
  "What gets you out of the house?",
  "Make it possible.",
];
const scenes = [
  "/onboarding-intent.jpg",
  "/onboarding-click.jpg",
  "/onboarding-group.jpg",
  "/onboarding-flow.jpg",
  "/onboarding-outings.jpg",
  "/onboarding-group.jpg",
];
export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [draft, setDraft] = useState<BaselineDraft>(emptyDraft);
  const [ready, setReady] = useState(false);
  const [designPreview, setDesignPreview] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('preview') === 'design') return;
    if (!loading && user && getUserProfile().hasCompletedOnboarding)
      router.replace("/you");
  }, [user, loading, router]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('preview') === 'design') {
      setDesignPreview(true);
      setReady(true);
      return;
    }
    let live = true;
    fetch("/api/onboarding/draft")
      .then((r) => { if (!r.ok) throw new Error('Draft unavailable'); return r.json(); })
      .then((data) => {
        if (live && isDraft(data.draft)) setDraft(data.draft);
      })
      .catch(() => {
        if (live) setLoadFailed(true);
        if (live)
          setError(
            "Your saved answers could not be loaded. Please reload to resume.",
          );
      })
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (ready) title.current?.focus();
  }, [draft.step, ready]);
  async function advance(back = false) {
    if (designPreview) {
      setError('');
      setDraft({...draft, step: back ? Math.max(1, draft.step - 1) : draft.step === 5 ? 1 : draft.step + 1});
      return;
    }
    if (loadFailed) return;
    if (!back && !validStep(draft, draft.step)) {
      setError("Please make your selection to continue.");
      return;
    }
    setBusy(true);
    setError("");
    const next = {
      ...draft,
      step: back ? Math.max(1, draft.step - 1) : Math.min(6, draft.step + 1),
    };
    try {
      const r = await fetch("/api/onboarding/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!r.ok)
        throw new Error(
          "We could not save your answers. They are still here; please retry.",
        );
      if (!back && draft.step === 6)
        router.push(user ? "/early-read" : "/join");
      else setDraft(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function toggle(
    key: "intent" | "clicks" | "outings",
    option: string,
    max: number,
  ) {
    const values = draft[key];
    if (!values.includes(option) && values.length === max) {
      setError(`Choose up to ${max}. Remove one to try another.`);
      return;
    }
    setError("");
    setDraft({
      ...draft,
      [key]: values.includes(option)
        ? values.filter((x) => x !== option)
        : [...values, option],
    });
  }
  const chips = (
    key: "intent" | "clicks" | "outings",
    options: string[],
    max: number,
  ) => (
    <div className="ob-choices">
      {options.map((o) => (
        <button
          type="button"
          key={o}
          aria-pressed={draft[key].includes(o)}
          onClick={() => toggle(key, o, max)}
        >
          {o}
        </button>
      ))}
    </div>
  );
  if (loadFailed) return <main className="ob-shell"><p role="alert">{error}</p><button className="ob-primary" onClick={() => window.location.reload()}>Retry loading saved answers</button></main>;
  if (!ready)
    return (
      <main className="ob-shell">
        <p role="status">Opening your early read…</p>
      </main>
    );
  return (
    <main className="ob-shell ob-immersive" data-step={draft.step}>
      <header className="ob-header">
        <Link href="/">SOUL TRIBE</Link>
        {designPreview && <nav aria-label="Design preview pages" className="ob-preview-nav"><span>Design preview · not saved</span>{[1,2,3,4,5].map(step => <button type="button" key={step} aria-label={`Preview question ${step}`} aria-current={draft.step === step ? 'step' : undefined} onClick={() => {setDraft({...draft,step});setError('');}}>{step}</button>)}</nav>}
        <div
          className="ob-petals"
          aria-label={`Question ${Math.min(draft.step, 5)} of 5${draft.step === 6 ? " complete. Profile details." : ""}`}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <i
              key={n}
              data-filled={
                draft.step > n || (draft.step === n && validStep(draft, n))
              }
            />
          ))}
        </div>
      </header>
      <div className="ob-layout">
        <div className="ob-photo">
          <img src={scenes[draft.step - 1]} alt="" />
          <span>
            {
              [
                "Meet",
                "Click",
                "Belong",
                "Connect",
                "Do things together",
                "Around your corner",
              ][draft.step - 1]
            }
          </span>
        </div>
        <section className="ob-content" aria-labelledby="question-title">
          <p className="ob-eyebrow">
            {draft.step <= 5
              ? `YOUR EARLY READ · ${draft.step} OF 5`
              : "YOUR HANDLE & NEIGHBOURHOOD"}
          </p>
          <h1 id="question-title" tabIndex={-1} ref={title}>
            {titles[draft.step - 1]}
          </h1>
          <p className="ob-helper">
            {draft.step <= 2
              ? "Pick up to 3."
              : draft.step === 3
                ? "Pick the setting that feels like you."
                : draft.step === 4
                  ? "Choose a place on each spectrum."
                  : draft.step === 5
                    ? "Pick up to 5 you’d be excited to join."
                    : "So people can find you, and plans can happen. Your area is used for practical fit."}
          </p>
          {draft.step === 1 && chips("intent", INTENTS, 3)}
          {draft.step === 2 && chips("clicks", CLICKS, 3)}
          {draft.step === 3 && (
            <div className="ob-groups">
              {GROUPS.map((g, i) => (
                <button
                  type="button"
                  aria-pressed={draft.group === g}
                  key={g}
                  onClick={() => setDraft({ ...draft, group: g })}
                >
                  <span aria-hidden="true">
                    {["••", "••••", "••••••", "••••••••"][i]}
                  </span>
                  {g}
                </button>
              ))}
            </div>
          )}
          {draft.step === 4 && (
            <div className="ob-flow">
              {FLOW.map((f) => (
                <fieldset key={f.key}>
                  <legend>{f.label}</legend>
                  <div className="ob-poles">
                    <span>{f.choices[0]}</span>
                    <span>{f.choices[4]}</span>
                  </div>
                  <div className="ob-stops">
                    {f.choices.map((label, i) => (
                      <button
                        type="button"
                        title={label}
                        aria-label={`${f.label}: ${label}`}
                        aria-pressed={draft[f.key] === i / 4}
                        key={label}
                        onClick={() => setDraft({ ...draft, [f.key]: i / 4 })}
                      >
                        <span aria-hidden="true">○</span>
                      </button>
                    ))}
                  </div>
                  <p>
                    {draft[f.key] === null
                      ? "Tap to choose"
                      : f.choices[draft[f.key]! * 4]}
                  </p>
                </fieldset>
              ))}
            </div>
          )}
          {draft.step === 5 && chips("outings", OUTINGS, 5)}
          {draft.step === 6 && (
            <div className="ob-fields">
              <label htmlFor="handle">Your unique handle</label>
              <input
                id="handle"
                autoComplete="username"
                maxLength={20}
                value={draft.handle}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    handle: e.target.value.trim().toLowerCase(),
                  })
                }
                placeholder="e.g. curious_mira"
              />
              <p>
                3–20 letters, numbers or underscores. Availability is confirmed
                when you save your account.
              </p>
              <label htmlFor="area">Where are plans easiest?</label>
              <select
                id="area"
                value={draft.area}
                onChange={(e) => setDraft({ ...draft, area: e.target.value })}
              >
                <option value="">Choose a Singapore area</option>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <label htmlFor="travel">How far are you happy to travel?</label>
              <select
                id="travel"
                value={draft.travel}
                onChange={(e) => setDraft({ ...draft, travel: e.target.value })}
              >
                <option value="">Choose your usual comfort zone</option>
                {TRAVEL.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
          <p className="ob-insight" aria-live="polite">
            {draft.step <= 5
              ? microInsight(draft, draft.step)
              : "Five answers. A first picture of how you connect."}
          </p>
          {error && (
            <p className="ob-error" role="alert">
              {error}
            </p>
          )}
          <nav className="ob-nav" aria-label="Onboarding">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                draft.step === 1 ? router.push("/") : void advance(true)
              }
            >
              ← Back
            </button>
            <button
              className="ob-primary"
              type="button"
              disabled={busy}
              onClick={() => void advance()}
            >
              {busy
                ? "Saving…"
                : draft.step === 6
                  ? "Keep my Early Read →"
                  : designPreview && draft.step === 5 ? "Back to page 1 →" : "Continue →"}
            </button>
          </nav>
          <p className="ob-small">
            {designPreview ? "Design preview only. Answers stay on this page and disappear on refresh." : "Saved when you continue. Resume on this browser for 7 days."}
          </p>
        </section>
      </div>
    </main>
  );
}
