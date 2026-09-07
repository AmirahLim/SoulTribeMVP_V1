import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './landing.module.css';

function CTA({children='Find your people'}:{children?:React.ReactNode}) {
  return <Link className={styles.cta} href="/onboarding">{children}<ArrowRight size={16} aria-hidden="true"/></Link>;
}
function Phone({screen,className=''}:{screen:'pitches'|'radar';className?:string}) {
  return <div className={styles.phone+' '+className}><div className={styles.screen}><img src={'/images/landing/'+screen+'.jpg'} alt={screen==='pitches'?'Soul Tribe Outings: Pitch Outing and Your Pitches':'Soul Tribe home: On your Radar, suggested outings for your social rhythm and interests'} loading="eager"/></div></div>;
}
export default function LandingPageContent(){
  return <div className={styles.page}>
    <a href="#main" className={styles.skip}>Skip to content</a>
    <nav className={styles.nav} aria-label="Main navigation"><a href="#features">Features</a><a href="#how">How it works</a><Link href="/auth/signin">Log in</Link></nav>
    <main id="main">
      <section className={styles.hero}>
        <img className={styles.backdrop} src="/images/early-read/seaside.jpg" alt="" fetchPriority="high"/>
        <div className={styles.heroText}><h1>Friendship matched to you.</h1><p>Pitch an outing for today, or find a plan on your radar.</p><CTA/></div>
        <div className={styles.heroPhones}><Phone screen="radar" className={styles.behind}/><Phone screen="pitches" className={styles.front}/></div>
      </section>
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeading}><h2>Your kind of people.<br/>Your kind of plans.</h2><p>Who you click with is personal. Soul Tribe brings together your interests, friendship preferences and social rhythm—then gives you somewhere to start.</p></div>
        <div className={styles.grid}>
          <article className={styles.card}>
            <div className={styles.matchArt}><span className={styles.label}>CONNECTION NOTES · EXAMPLE</span><div className={styles.circles}><span>You</span><i>↔</i><span>A new<br/>friend</span></div><h4>A shared pace.</h4><p>You both prefer thoughtful check-ins<br/>to messaging all day.</p><div className={styles.tags}><span>How you connect</span><span>What you value</span></div></div>
            <div className={styles.copy}><h3>Friendship matching,<br/>specific to you.</h3><p>More than liking the same things. Discover people through the friendship you want, the way you keep in touch and the time you enjoy sharing. Connection Notes explain where you click.</p></div>
          </article>
          <article className={styles.card}>
            <div className={styles.productArt}><Phone screen="pitches"/></div>
            <div className={styles.copy}><h3>Pitch it while<br/>you feel like going.</h3><p>Free tonight? Put your idea out there with a time and place. See who’s interested, confirm your group and make it happen—without another week of “we should”.</p></div>
          </article>
          <article className={styles.wideCard}>
            <div className={styles.radarArt}><Phone screen="pitches" className={styles.sidePhone}/><Phone screen="radar"/><Phone screen="pitches" className={styles.otherPhone}/></div>
            <div className={styles.copy}><h3>On your radar.<br/>Not just on a list.</h3><p>Suggested pitches and outings shaped by your interests and social rhythm. Find something you actually want to do, ask to join, and meet the people going.</p></div>
          </article>
          <article className={styles.card}>
            <div className={styles.paperArt}><div className={styles.polaroid}><img src="/images/early-read/evening.jpg" alt="Two people sharing a quiet evening by the sea" loading="lazy"/><span>a little more you.</span></div><div className={styles.paper}>The little things<br/>that matter to you.<small>Your early read</small></div></div>
            <div className={styles.copy}><h3>Understand your<br/>way of connecting.</h3><p>Start with six questions. Open a personal reading about what you want from friendship, then build a fuller picture as you go.</p></div>
          </article>
          <article className={styles.card}>
            <div className={styles.inviteArt}><div><small>AN EXAMPLE INVITATION</small><p>A walk, then dinner?</p><span>Friday · 6:30 pm</span></div><div><small>ONCE YOUR HOST CONFIRMS</small><p>You’re going.</p><span>Your group can chat and sort the details.</span></div></div>
            <div className={styles.copy}><h3>A plan you can<br/>actually show up to.</h3><p>Keep your pitches, invitations and confirmed outings together. Less chasing the group chat. More knowing where to be.</p></div>
          </article>
        </div>
        <p className={styles.caption}>Product previews shown for illustration. Plans and availability vary.</p>
      </section>
      <section id="how" className={styles.how}>
        <img className={styles.backdrop} src="/images/early-read/shore.jpg" alt="" loading="lazy"/>
        <div className={styles.sectionHeading}><h2>How it works</h2><p>A little self-understanding. A few people worth meeting. Something to do together.</p></div>
        <div className={styles.howPhones}><Phone screen="radar" className={styles.behind}/><Phone screen="pitches" className={styles.front}/></div>
        <div className={styles.steps}>{[
          ['01','Tell us about you.','Six questions about your interests, friendship preferences and pace. Get your early read.'],
          ['02','Find where you click.','Save your profile and explore people, with Connection Notes to start the conversation.'],
          ['03','Put a plan out there.','Pitch an outing or ask to join one on your radar. Once confirmed, chat and meet.']
        ].map(([n,t,p])=><article key={n}><small>{n}</small><h3>{t}</h3><p>{p}</p></article>)}</div>
      </section>
      <section id="faq" className={styles.faq}><h2>A few good questions.</h2>{[
        ['Is Soul Tribe for dating?','No. It’s for friendship: people to share an interest, an ordinary evening or a new chapter with.'],
        ['What makes a match personal?','Your profile brings together interests, friendship preferences and social rhythm. Connection Notes show what you share and where expectations differ.'],
        ['Can I make a plan for today?','Yes. Pitch an activity with a time and place, or request to join an upcoming outing. Plans depend on who is available and the host confirming the group.'],
        ['How do I get started?','Answer six questions and see your early read. Then create an account and save your profile to explore people and outings. Soul Tribe is for adults aged 18 and over.']
      ].map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</section>
      <section className={styles.closing}><h2>Find your people.</h2><p>The ones who share your depth, your rhythm,<br/>and a little room in their lives.</p><CTA>Get my early read</CTA><div className={styles.photoFan}>{['seaside','sunset','evening'].map(name=><img key={name} src={'/images/early-read/'+name+'.jpg'} alt="" loading="lazy"/>)}</div></section>
    </main>
    <footer className={styles.footer}><p>More time together, outside the app.</p><div><a href="#features">Features</a><a href="#how">How it works</a><a href="#faq">FAQ</a><Link href="/auth/signin">Log in</Link></div></footer>
  </div>;
}
