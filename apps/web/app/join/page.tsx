"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/authContext";
import { completeDraft, isDraft } from "../../lib/sixQuestionOnboarding";
import "../onboarding/onboarding.css";
export default function JoinPage() {
  const router = useRouter();
  const { user, loading, signInWithOtp, verifyOtp, signInWithGoogle } =
    useAuth();
  const [birthDate,setBirthDate]=useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/onboarding/draft")
      .then((r) => r.json())
      .then((data) => {
        if (!isDraft(data.draft) || !completeDraft(data.draft))
          router.replace("/onboarding");
        else setReady(true);
      })
      .catch(() => setError("Unable to load your answers. Please reload."));
  }, [router]);
  useEffect(() => {
    if (user && !loading && ready) void fetch('/api/onboarding/eligibility').then(r=>r.json()).then(d=>{if(d.birthYear)router.replace('/early-read');}).catch(()=>{});
  }, [user, loading, ready, router]);
  async function checkAge() {
    const r=await fetch('/api/onboarding/eligibility',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({birthDate})});
    const data=await r.json();
    if(!r.ok){setError(data.error);return false;}return true;
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try { if(!sent && !await checkAge()){setBusy(false);return;} } catch {setError("Could not check your age. Please retry.");setBusy(false);return;}
    if(user){router.replace('/early-read');setBusy(false);return;}
    const result = sent
      ? await verifyOtp(email, code)
      : await signInWithOtp(email, "/early-read");
    setBusy(false);
    if (result.error) setError(result.error.message);
    else if (!sent) setSent(true);
    else router.replace("/early-read");
  }
  return (
    <main className="ob-shell">
      <section className="ob-read">
        <p className="ob-eyebrow">YOUR FIRST PICTURE IS TAKING SHAPE</p>
        <h1>Keep your Early Read.</h1>
        <p>
          Create your account to save your answers and see where friendship
          could start. Already a member? Use your usual email.
        </p>
        <div className="ob-fields"><label htmlFor="signup-birth-date">Date of birth</label><input id="signup-birth-date" type="date" autoComplete="bday" required value={birthDate} disabled={sent} onChange={e=>setBirthDate(e.target.value)} /><p>For the 18+ eligibility check. We do not retain your full date of birth or display it on your profile. This is a self-reported check.</p></div>
        <form className="ob-fields" onSubmit={submit}>
          <label htmlFor="email">Email address</label>
          <input
            required
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={sent}
            onChange={(e) => setEmail(e.target.value)}
          />
          {sent && (
            <>
              <label htmlFor="code">Code from your email</label>
              <input
                id="code"
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]{6,8}"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <p>
                You can also open the email link in this browser. Your answers
                stay here while you verify.
              </p>
            </>
          )}
          <button className="ob-primary" disabled={!ready || busy}>
            {busy
              ? "One moment…"
              : sent
                ? "Continue to my Early Read"
                : "Send my sign-in code"}
          </button>
        </form>
        <button
          className="ob-primary"
          style={{ marginTop: 16 }}
          disabled={!ready || busy}
          onClick={async () => {
            setBusy(true);
            try {if(!await checkAge()){setBusy(false);return;}}catch{setError("Could not check your age. Please retry.");setBusy(false);return;}
            const r = await signInWithGoogle("/early-read");
            if (r.error) setError(r.error.message);
            setBusy(false);
          }}
        >
          Continue with Google
        </button>
        {error && (
          <p role="alert" className="ob-error">
            {error}
          </p>
        )}
        <Link href="/onboarding">← Back to my answers</Link>
      </section>
    </main>
  );
}
