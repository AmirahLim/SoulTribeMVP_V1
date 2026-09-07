import Link from 'next/link';
import { ArrowRight, Feather } from 'lucide-react';
import styles from './landing.module.css';

function StartLink({ children = 'Find your people' }: { children?: React.ReactNode }) {
  return <Link href="/onboarding" className={styles.cta}>{children}<ArrowRight size={17} aria-hidden="true" /></Link>;
}

const questions = [
  ['Is this a dating app?', 'No. Soul Tribe is for friendship: people to share an interest, an ordinary evening, or a new chapter with.'],
  ['What does the reading tell me?', 'It brings together what you share about friendship, communication and the things you enjoy. Your first six answers give you an early read; you can build a fuller picture as you go.'],
  ['How do I actually meet someone?', 'Explore people and their Connection Notes, or find an outing you want to join. You can also pitch your own plan. The host confirms who is joining, then the group can chat and arrange the details.'],
  ['Can I make a spontaneous plan?', 'Yes. Put a time, place and activity into a pitch, or look for an upcoming outing. Whether a plan comes together depends on who is available and the host confirming the group.'],
  ['When do I create an account?', 'Start with the questions and see your early read first. Then sign up to save your profile and explore people and outings. Soul Tribe is for adults aged 18 and over.'],
];

export default function LandingPageContent() {
  return <div className={styles.page}>
    <a className={styles.skip} href="#main">Skip to content</a>
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Soul Tribe home"><Feather size={23} aria-hidden="true" />Soul Tribe</Link>
      <nav aria-label="Main navigation"><a href="#features">The little details</a><a href="#how">How it works</a><Link href="/auth/signin">Log in</Link></nav>
    </header>
    <main id="main">
      <section className={styles.hero} aria-labelledby="hero-title">
        <img className={styles.heroImage} src="/images/early-read/seaside.jpg" alt="" fetchPriority="high" />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>A friendship app · Starting in Singapore</p>
          <h1 id="hero-title">Find your people.<br /><em>Make a real plan.</em></h1>
          <p className={styles.heroDescription}>Understand how you connect. Meet people who share what matters to you. Find something to do together—or invite them to your own plan.</p>
          <StartLink />
          <p className={styles.micro}>Six questions to begin. A little more you.</p>
        </div>
        <div className={styles.heroCaption}><span>Good company.<br />Nothing grand required.</span><a href="#features">Take a closer look ↓</a></div>
      </section>

      <section className={styles.intro}>
        <p className={styles.eyebrow}>For the friendships you still want to find</p>
        <h2>You can know a lot of people.<br /><em>And still miss being known.</em></h2>
        <div className={styles.introColumns}>
          <p>Someone who doesn’t mistake your quiet for disinterest. Who’s happy with a long conversation, or no conversation at all. Who means it when they say, “Let’s go.”</p>
          <p>Soul Tribe is built for people who believe real friendship is rare—and worth seeking. Not just anyone. People who share your depth, your rhythm, and a little room in their lives.</p>
        </div>
      </section>

      <section id="features" className={styles.features} aria-labelledby="features-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>A little understanding. An actual beginning.</p><h2 id="features-title">Less guessing.<br /><em>More getting each other.</em></h2></div><p>Common interests open a conversation. How you like to spend time, keep in touch and show up for each other helps it continue.</p></div>
        <div className={styles.featureGrid}>
          <article className={styles.feature}>
            <div className={styles.readVisual} aria-label="Illustrative early-read preview">
              <div className={styles.miniPhoto}><img src="/images/early-read/evening.jpg" alt="Two people sitting beside the sea at dusk" loading="lazy" /><span>room to be yourself</span></div>
              <div className={styles.note}><span>A NOTE FOR YOU</span><p>You value time together that doesn’t need a big occasion.</p><small>Illustrative reading</small></div>
            </div>
            <div className={styles.featureCopy}><p className={styles.eyebrow}>01 · Your early read</p><h3>Put words to what<br />you’ve been looking for.</h3><p>Maybe it’s depth. Maybe it’s ease. Answer a few questions about what you want from friendship and see your preferences brought together in a personal reading.</p></div>
          </article>
          <article className={styles.feature}>
            <div className={styles.matchVisual}>
              <p className={styles.eyebrow}>Connection notes · An example</p>
              <div className={styles.initials} aria-hidden="true"><span>You</span><i>↔</i><span>A new<br />friend</span></div>
              <h4>There’s no rush to reply.</h4><p>You both prefer thoughtful check-ins to keeping a conversation going all day.</p><div className={styles.tags}><span>Shared pace</span><span>Room to breathe</span></div>
            </div>
            <div className={styles.featureCopy}><p className={styles.eyebrow}>02 · People & connection notes</p><h3>A little context<br />before the first hello.</h3><p>Discover people and read what connects you—from shared interests to the way you keep in touch. See where expectations differ, too. You don’t have to start completely in the dark.</p></div>
          </article>
          <article className={styles.planFeature}>
            <div className={styles.planCopy}><p className={styles.eyebrow}>03 · Pitch an outing</p><h3>“We should”<br /><em>needs a when.</em></h3><p>A free evening. A film you don’t want to miss. A walk you’d rather share. Pitch the thing you actually want to do, with a time and place—or ask to join someone else’s plan.</p><p>Once the host confirms the group, chat together and sort the details. Give a new friendship somewhere to begin.</p><a href="/onboarding" className={styles.textLink}>Make room for a good evening <ArrowRight size={16} aria-hidden="true" /></a></div>
            <div className={styles.pitch}><img src="/images/early-read/shore.jpg" alt="Two people enjoying an evening beside the water" loading="lazy" /><div><p className={styles.eyebrow}>An example pitch · Not a live listing</p><h4>A walk, then somewhere for dinner?</h4><p>Friday · 6:30 pm<br />East Coast Park, Singapore</p><span className={styles.pitchFooter}>A small plan. An open invitation. ↗</span></div></div>
          </article>
        </div>
      </section>

      <section id="how" className={styles.how} aria-labelledby="how-title">
        <p className={styles.eyebrow}>How it works</p><h2 id="how-title">Start with you.<br /><em>See where it goes.</em></h2>
        <div className={styles.steps}>{[
          ['01', 'Tell us a little.', 'Six questions about friendship, your pace and what you enjoy. No perfect answer required.'],
          ['02', 'Get your early read.', 'A few personal notes to open and explore. Create an account and save your profile when you’re ready.'],
          ['03', 'Find a person. Pick a plan.', 'Explore people, request to join an outing, or pitch something of your own. Take the next step into real life.']
        ].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        <StartLink>Get my early read</StartLink>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title"><p className={styles.eyebrow}>A few things you might be wondering</p><h2 id="faq-title">Before you say hello.</h2>{questions.map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</section>
      <section className={styles.closing}><img src="/images/early-read/sunset.jpg" alt="" loading="lazy" /><div><p className={styles.eyebrow}>For friendship. For real life.</p><h2>Someone to tell<br /><em>the little things to.</em></h2><p>Start with a little about yourself.<br />There’s room for someone new.</p><StartLink /></div></section>
    </main>
    <footer className={styles.footer}><Link href="/" className={styles.brand}>Soul Tribe</Link><p>More time together, outside the app.</p><nav aria-label="Footer navigation"><a href="#features">Features</a><a href="#how">How it works</a><Link href="/auth/signin">Log in</Link></nav></footer>
  </div>;
}
