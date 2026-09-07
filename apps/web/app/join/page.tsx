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
    if (user && !loading && ready) router.replace("/early-read");
  }, [user, loading, ready, router]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
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
