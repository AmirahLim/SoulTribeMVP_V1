"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PhotoPicker from "./PhotoPicker";
import {LIFE_CONTEXTS,LIFE_CONTEXT_DETAILS} from "../../lib/lifeContext";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/authContext";
import { getUserProfile } from "../../lib/userStore";
import {checkHandleAvailability} from '../../lib/supabaseAuth';
import {useUsernameAvailability} from '../../lib/useUsernameAvailability';
import {
  AREAS,
  CLICKS,
  ACTIVE_RHYTHM as RHYTHM,
  upgradeDraft,
  canonicalRhythm,
  FRIEND_QUALITIES,
  QUALITY_DETAILS,
  GROUPS,
  groupChoices,
  INTENTS,
  OUTINGS,
  BaselineDraft,
  emptyDraft,
  isDraft,
  microInsight,
  validStep,
} from "../../lib/sixQuestionOnboarding";
import "./onboarding.css";
const titles = [
  "What are you hoping to find here?",
  "When do you know you’re clicking?",
  "What’s your social sweet spot?",
  "What matters to you in a friendship?",
  "What’s your friendship rhythm?",
  "What gets you out of the house?",
  "Make it possible.",
];
const contextLines = [
  'Because not everyone is looking for the same kind of friendship.',
  'Shared interests can start a conversation. Chemistry is what makes you want another one.',
  'The right people can feel completely different in the wrong setting.',
  '',
  'Sometimes the connection isn’t the problem. Life logistics are.',
  'Because a good match means very little if you never actually meet.',
];
const scenes = [
  "/onboarding-intent.jpg",
  "/onboarding-click.jpg",
  "/onboarding-group.jpg",
  "/onboarding-flow.jpg",
  "/onboarding-friendship-rhythm.jpg",
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
  const [birthDate,setBirthDate]=useState('');
  const [ageChecked,setAgeChecked]=useState(false);
  const usernameCheck=useUsernameAvailability(draft.handle,ready&&draft.step===7&&!designPreview,user?.id);
  const title = useRef<HTMLHeadingElement>(null);
  const newDraft = useRef(false);
  const lastPersisted = useRef<string | null>(null);
  useEffect(()=>{
    let active=true;
    setAgeChecked(false);
    fetch('/api/onboarding/eligibility',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{if(active)setAgeChecked(!!data?.birthYear);}).catch(()=>{});
    return()=>{active=false;};
  },[user?.id]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('preview') === 'design') return;
    if (!loading && user) {
      const profile=getUserProfile();
      // Identity only, from this account. Never prefill missing questionnaire answers.
      setDraft(d=>({...d,handle:d.handle||profile.handle||'',area:d.area||profile.homeArea||''}));
    }
  }, [user, loading]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('preview') === 'design') {
      setDesignPreview(true);
      setReady(true);
      return;
    }
    if(new URLSearchParams(window.location.search).get('restart')==='1') {
      newDraft.current=true;setReady(true);return;
    }
    let live = true;
    fetch("/api/onboarding/draft")
      .then((r) => { if (!r.ok) throw new Error('Draft unavailable'); return r.json(); })
      .then((data) => {
        if (live && isDraft(data.draft)) setDraft(upgradeDraft(data.draft));
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
    function otherField(key:'intentOther'|'clicksOther'|'qualityOther'|'outingOther'|'connectionOther'|'planningOther'|'punctualityOther',visible:boolean,label:string) {
    return visible ? <label className="ob-other-field">{label}<input maxLength={120} value={draft[key]??''} placeholder="In your own words…" onChange={e=>{setError('');setDraft({...draft,[key]:e.target.value});}}/><small>Up to 120 characters. Please don’t include personal contact details.</small></label> : null;
  }
  function qualityChips() { return <div className="ob-choices">{FRIEND_QUALITIES.map(quality=><button type="button" key={quality} aria-pressed={(draft.desiredQualities??[]).includes(quality)} onClick={()=>{
    const previous=draft.desiredQualities??[];
    if(!previous.includes(quality)&&previous.length===5){setError('Pick up to 5 qualities. Remove one to try another.');return;}
    const values=previous.includes(quality)?previous.filter(q=>q!==quality):[...previous,quality];
    setError('');setDraft({...draft,desiredQualities:values,qualityOther:values.includes('Other')?draft.qualityOther:''});
  }}>{quality==='Other'?'Other +':quality}</button>)}</div>; }

  async function advance(back = false) {
    if (designPreview) {
      setError('');
      setDraft({...draft, step: back ? Math.max(1, draft.step - 1) : draft.step === 7 ? 1 : draft.step + 1});
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
      step: back ? Math.max(1, draft.step - 1) : Math.min(7, draft.step + 1),
    };
    try {
      if(!back&&draft.step===7) {
        const check=await checkHandleAvailability(draft.handle,user?.id);
        if(!check.available)throw new Error(check.message||'Choose an available username.');
      }
      const payload=JSON.stringify(canonicalRhythm(next));
      // Retrying a failed claim must use its original draft receipt. Do not
      // create a second draft when the database committed but the reply was lost.
      if(lastPersisted.current!==payload) {
      const r = await fetch("/api/onboarding/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(newDraft.current?{'x-onboarding-new-draft':'1'}:{}) },
        body: payload,
      });
      if (!r.ok)
        throw new Error(
          "We could not save your answers. They are still here; please retry.",
        );
      lastPersisted.current=payload;
      }
      newDraft.current=false;
      if (!back && draft.step === 7) {
        // Full DOB stays in this component only. The server returns a signed
        // eligibility receipt tied to the saved draft, retaining only the year.
        if(!ageChecked||birthDate) {
          const checked=await fetch('/api/onboarding/eligibility',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({birthDate})});
          const result=await checked.json();
          if(!checked.ok)throw new Error(result.error||'Please complete your private 18+ check.');
          setAgeChecked(true);
        }
        // Preview first. Save Early Read opens auth choices; authentication claims the
        // draft using the authenticated account before opening home.
        router.push("/early-read");
      } else setDraft(next);
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
    <div className={`ob-choices${key === "clicks" ? " ob-click-choices" : ""}`}>
      {options.map((o) => (
        <button
          type="button"
          key={o}
          aria-pressed={draft[key].includes(o)}
          onClick={() => toggle(key, o, max)}
        >
          {o === "Other" ? key === "outings" ? "+ Something Else" : "Other +" : o}
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
        {designPreview && <nav aria-label="Design preview pages" className="ob-preview-nav"><span>Design preview · not saved</span>{[1,2,3,4,5,6].map(step => <button type="button" key={step} aria-label={`Preview question ${step}`} aria-current={draft.step === step ? 'step' : undefined} onClick={() => {setDraft({...draft,step});setError('');}}>{step}</button>)}</nav>}
        <div
          className="ob-petals"
          aria-label={`Question ${Math.min(draft.step, 6)} of 6${draft.step === 7 ? " complete. Profile details." : ""}`}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
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
            {draft.step <= 6
              ? `YOUR SOCIAL WORLD TAKING SHAPE · ${draft.step} OF 6`
              : "YOUR HANDLE & NEIGHBOURHOOD"}
          </p>
          <h1 id="question-title" tabIndex={-1} ref={title}>
            {titles[draft.step - 1]}
          </h1>
          {!!contextLines[draft.step - 1] && <p className="ob-context-line">{contextLines[draft.step - 1]}</p>}
          <p className="ob-helper">
            {draft.step <= 2
              ? "Pick up to 3."
              : draft.step === 3
                ? "Pick up to 2 settings where you feel most like yourself."
                : draft.step === 4
                  ? "Pick up to 5."
                  : draft.step === 5 ? "" : draft.step === 6
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
                  aria-pressed={groupChoices(draft).includes(g)}
                  key={g}
                  onClick={() => {
                    const previous = groupChoices(draft);
                    if (!previous.includes(g) && previous.length === 2) { setError('Pick up to 2. Remove one to try another.'); return; }
                    const choices = previous.includes(g) ? previous.filter(x => x !== g) : [...previous, g];
                    setError(''); setDraft({ ...draft, group: choices[0] || '', groupChoices: choices });
                  }}
                >
                  <span aria-hidden="true">
                    {["••", "••••", "••••••", "••••••••"][i]}
                  </span>
                  {g}
                  <small className="ob-group-count">{['2 people · just the two of you', '3–4 people · around a table', '5–9 people · a shared activity', '10+ people · a bigger gathering'][i]}</small>
                </button>
              ))}
            </div>
          )}
          {draft.step === 4 && qualityChips()}
          {draft.step === 5 && <div className="ob-rhythm">{RHYTHM.map(r => <fieldset key={r.key}><legend>{r.title}</legend>{r.prompt && <p>{r.prompt}</p>}<div className="ob-choices">{r.choices.map(choice => <button type="button" key={choice} aria-pressed={draft[r.key]===choice} onClick={()=>{setError('');setDraft({...draft,[r.key]:choice,[r.other]:'',contact:r.key==='connectionChoice'?null:draft.contact,planning:r.key==='planningChoice'?null:draft.planning});}}>{choice}</button>)}</div></fieldset>)}</div>}
          {draft.step === 6 && <div className="ob-outing-cloud">{chips("outings", [...OUTINGS,'Other'], 5)}{otherField('outingOther',draft.outings.includes('Other'),'Something else you would enjoy')}</div>}
          {draft.step === 7 && (
            <div className="ob-fields">
              <label htmlFor="handle">Your public username (handle)</label>
              <input
                id="handle"
                autoComplete="username"
                aria-describedby="username-help username-availability"
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
              <p id="username-help">Username and handle are the same thing: the public name people see. Choose 3–20 lowercase letters, numbers or underscores. Your Google name and email stay private.</p>
              <p id="username-availability" role="status" aria-live="polite">{designPreview?'Availability is checked outside design preview.':usernameCheck.message}</p>
              <PhotoPicker previewOnly={designPreview} />
              {!ageChecked&&<><label htmlFor="onboarding-birth-date">Date of birth · private 18+ check</label><input id="onboarding-birth-date" type="date" autoComplete="bday" value={birthDate} onChange={e=>setBirthDate(e.target.value)}/><p>Soul Tribe is for adults 18+. This is self-reported. Your full date of birth is not retained or shown on your profile.</p></>}
              <div id="life-phase-label" className="ob-field-label">Life phase</div>
              <details className="ob-life-context">
                <summary id="life-phase-toggle" aria-labelledby="life-phase-label life-phase-value"><span id="life-phase-value">{(draft.lifeContexts??[]).length ? `${(draft.lifeContexts??[]).length} selected · ${(draft.lifeContexts??[]).join(', ')}` : 'Choose up to 3'}</span></summary>
                <p>Pick up to 3 that feel like you right now.</p>
                {LIFE_CONTEXTS.map(context=><label key={context} className="ob-life-option"><input type="checkbox" checked={(draft.lifeContexts??[]).includes(context)} disabled={!(draft.lifeContexts??[]).includes(context)&&(draft.lifeContexts??[]).length>=3} onChange={()=>{
                  const selected=draft.lifeContexts??[];
                  setDraft({...draft,setupRevision:2,lifeContextsPublic:true,lifeContexts:selected.includes(context)?selected.filter(c=>c!==context):[...selected,context],country:draft.country??'',travelKm:draft.travelKm??10});
                }}/><span>{context}{LIFE_CONTEXT_DETAILS[context]&&<small>{LIFE_CONTEXT_DETAILS[context]}</small>}</span></label>)}
              </details>
              <p>Describe the chapter you’re in, not an age label.</p>
              <p>Selections you make here appear on your profile and help suggest people in a similar chapter.</p>
              <label htmlFor="area">Where are you based?</label>
              <input id="area" maxLength={100} autoComplete="address-level2" value={draft.area} placeholder="Town, city or neighbourhood" onChange={e=>setDraft({...draft,area:e.target.value})} />
              <label htmlFor="country">Country or region</label>
              <input id="country" maxLength={80} autoComplete="country-name" value={draft.country??''} placeholder="e.g. Singapore, Malaysia, Australia" onChange={e=>setDraft({...draft,country:e.target.value})} />
              <p>No exact address needed. This is self-reported, not a verified location.</p>
              <label htmlFor="travel-km">How far are you willing to travel? <output htmlFor="travel-km">{draft.travelKm??10} km</output></label>
              <input id="travel-km" type="range" min={1} max={50} step={1} value={draft.travelKm??10} onChange={e=>setDraft({...draft,travelKm:Number(e.target.value)})} />
              <div className="ob-range-labels"><span>1 km</span><span>50 km</span></div>
              <p>We favour the same reported town and country. Your chosen distance is saved, but town names alone cannot verify who is within that radius.</p>

            </div>
          )}
          <p className="ob-insight" aria-live="polite">
            {draft.step <= 6
              ? microInsight(draft, draft.step)
              : "Six answers. A first picture of how you connect."}
          </p>
          {error && (
            <p className="ob-error" role="alert">
              {error}
              {error.includes('profile changed')&&<Link href="/onboarding?restart=1">Start a fresh set of answers</Link>}
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
                : draft.step === 7
                  ? "Get my Early Read →"
                  : designPreview && draft.step === 6 ? "Preview profile details →" : "Continue →"}
            </button>
          </nav>
          {draft.step === 7 && <p className="ob-small">Your answers help us suggest people you might click with. Manage answer sharing from your profile.</p>}
          {designPreview && <p className="ob-small">Design preview only. Answers are not saved.</p>}
        </section>
      </div>
    </main>
  );
}
