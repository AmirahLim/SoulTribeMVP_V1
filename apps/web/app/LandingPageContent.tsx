import Link from 'next/link';
import { ArrowDown, ArrowRight, Feather } from 'lucide-react';

const steps = [
  ['01', 'A little about you.', 'Six questions about what you want in a friendship, how you keep in touch, and what you’d actually leave the house for.', 'Your Social Signature', 'A first look at your friendship style. You can add to it as you go.'],
  ['02', 'Someone you might click with.', 'Discover people with room for the kind of friendship you’re looking for. See what you have in common—and where your expectations might differ.', 'Connection Notes', 'A little context before you say hello. A starting point, not a promise of chemistry.'],
  ['03', 'Something to do together.', 'Join a plan that catches your eye, or put one out there. The host brings the group together; once you’re confirmed, you can chat and sort the details.', 'Real-life plans', 'Coffee, a gig, a walk that turns into dinner. Give the friendship somewhere to start.'],
];

function StartLink({ children }: { children: React.ReactNode }) {
  return <Link href="/onboarding" className="inline-flex min-h-14 items-center justify-center gap-8 rounded-full bg-[#f5f1e9] px-7 py-4 text-sm font-medium text-[#17231c] hover:bg-white">{children}<ArrowRight size={18} aria-hidden="true" /></Link>;
}

export default function LandingPageContent() {
  return (
    <div className="relative isolate min-h-screen bg-[#171915] text-[#fffdf9]">
      <img src="/user-intro-bg.jpg" alt="" fetchPriority="high" className="fixed inset-0 -z-20 h-full w-full object-cover" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/65 to-black/90" />
      <a href="#intro-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-black">Skip to content</a>
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-7 md:px-12">
        <Link href="/" aria-label="Soul Tribe home" className="flex items-center gap-2 text-lg font-semibold tracking-tight md:text-2xl"><Feather size={24} aria-hidden="true" />SOUL TRIBE</Link>
        <nav aria-label="Main navigation" className="flex items-center gap-6 text-sm">
          <a href="#how-it-works" className="hidden py-3 underline-offset-4 hover:underline sm:block">How it works</a>
          <Link href="/login" className="py-3 underline-offset-4 hover:underline">Log in</Link>
        </nav>
      </header>
      <main id="intro-content">
        <section className="mx-auto flex min-h-[76svh] max-w-7xl flex-col justify-center px-6 pb-14 pt-12 md:px-12 md:pb-20">
          <p className="mb-7 text-[11px] uppercase tracking-[.2em] text-white/85">New friends. Real plans. Singapore.</p>
          <h1 className="max-w-4xl text-[clamp(3.5rem,8vw,7.5rem)] font-normal leading-[.98] tracking-[-.055em]">People to<br />do life with.</h1>
          <p className="mt-8 max-w-xl text-lg font-light leading-relaxed md:text-xl">Soul Tribe helps you meet new friends in Singapore, find people you might click with, and make plans to meet in real life.</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <StartLink>Find your people</StartLink>
            <p className="text-xs leading-relaxed text-white/80">Start with six questions.<br />Create your account after.</p>
          </div>
          <a href="#how-it-works" className="mt-14 inline-flex w-fit items-center gap-3 py-3 text-xs text-white/85">A little more about us <ArrowDown size={14} aria-hidden="true" /></a>
        </section>
        <section aria-labelledby="sound-familiar" className="mx-auto grid max-w-7xl gap-8 border-t border-white/25 px-6 py-16 md:grid-cols-[1fr_2fr] md:gap-16 md:px-12 md:py-24">
          <h2 id="sound-familiar" className="text-xs uppercase tracking-[.18em] text-white/80">Sound familiar?</h2>
          <div>
            <p className="max-w-3xl text-3xl font-light leading-tight tracking-tight md:text-5xl">Your friends are busy.<br />The group chat says “soon”.<br />There’s a gig you’d love to go to.</p>
            <p className="mt-7 max-w-xl text-base font-light leading-relaxed text-white/85">You don’t have to replace your circle to want a few new people in it. Maybe you’ve just moved here. Maybe life has shifted. Or you just want someone who’s up for the same things.</p>
            <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-white/85">That’s what Soul Tribe is for. Making room for new friendships, one actual plan at a time.</p>
          </div>
        </section>
        <section id="how-it-works" aria-labelledby="how-title" className="mx-auto max-w-7xl scroll-mt-6 px-6 py-12 md:px-12 md:py-20">
          <p className="text-xs uppercase tracking-[.18em] text-white/80">How it works</p>
          <h2 id="how-title" className="mb-12 mt-5 max-w-2xl text-4xl font-light leading-tight tracking-tight md:text-6xl">From “we should”<br />to “see you there”.</h2>
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map(([number, title, description, feature, detail]) => (
              <article key={number} className="border-t border-white/35 pt-5">
                <span className="text-xs text-white/70">{number}</span>
                <h3 className="mt-7 text-2xl font-normal leading-tight tracking-tight">{title}</h3>
                <p className="mt-4 text-sm font-light leading-7 text-white/90">{description}</p>
                <p className="mt-7 text-[11px] uppercase tracking-widest text-white/80">{feature}</p>
                <p className="mt-2 text-sm font-light leading-6 text-white/80">{detail}</p>
              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="plans-title" className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:gap-16 md:px-12 md:py-24">
          <div>
            <p className="text-xs uppercase tracking-[.18em] text-white/80">Make it a plan</p>
            <h2 id="plans-title" className="mt-5 text-4xl font-light leading-tight tracking-tight md:text-5xl">A shared interest.<br />An easy first invite.</h2>
            <p className="mt-6 max-w-md text-base font-light leading-relaxed text-white/85">You don’t need a big occasion. Just something you’d enjoy, and a few people who’d be up for it too.</p>
          </div>
          <div className="border-y border-white/30 py-2">
            <p className="py-4 text-[10px] uppercase tracking-[.18em] text-white/70">A few ideas—not live listings</p>
            {['Coffee, then a record-store browse?', 'Anyone up for an indie film?', 'An evening walk. Dinner if we feel like it.'].map((idea, index) => <p key={idea} className="flex items-start gap-6 border-t border-white/20 py-6 text-xl font-light leading-snug"><span className="pt-1 text-xs text-white/60">0{index + 1}</span>{idea}</p>)}
          </div>
        </section>
        <section className="mx-auto max-w-7xl border-t border-white/25 px-6 py-16 text-center md:px-12 md:py-24" aria-labelledby="start-title">
          <p className="text-xs uppercase tracking-[.18em] text-white/80">For friendship. Not dating.</p>
          <h2 id="start-title" className="mx-auto mt-6 max-w-2xl text-4xl font-light leading-tight tracking-tight md:text-6xl">Who would you like<br />in your next chapter?</h2>
          <p className="mx-auto mb-8 mt-6 max-w-md text-sm leading-relaxed text-white/85">Tell us a little about yourself. Get a first read on your friendship style, then explore people and plans.</p>
          <StartLink>Let’s start</StartLink>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-white/20 px-6 py-7 text-xs text-white/70 md:px-12"><span>SOUL TRIBE · Singapore</span><span>More time together, outside the app.</span></footer>
    </div>
  );
}
