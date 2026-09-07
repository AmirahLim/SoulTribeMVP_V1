import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './landing.module.css';

function CTA({children='Find your people'}:{children?:React.ReactNode}) {
  return <Link className={styles.cta} href="/onboarding">{children}<ArrowRight size={16} aria-hidden="true"/></Link>;
}
type AppScreen = 'pitches'|'radar'|'invited'|'guests'|'past';
const screenDescriptions: Record<AppScreen,string> = {
  pitches: 'Your Pitches: gathering interest and Manage Pitch controls',
  radar: 'Home and On your Radar: recommended outings, with an anonymised member identity',
  invited: 'An outing invitation: details, Join, Pass and View Outing',
  guests: 'Invite Guests: matching profiles to invite to your outing, with anonymised names and photos',
  past: 'Past outings and Rhythm Check, with anonymised host names and photos',
};
function Phone({screen,className=''}:{screen:AppScreen;className?:string}) {
  return <figure className={styles.actualPreview+' '+className}><div className={styles.phone}><div className={styles.screen}><img src={'/images/landing/actual-'+screen+'.jpg'} alt={screenDescriptions[screen]} loading="lazy"/></div></div></figure>;
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
      <section className={styles.manifesto} aria-labelledby="why-title">
        <div><p className={styles.kicker}>To make meaningful human connection feel possible again.</p><h2 id="why-title">Not a dating app.<br/>Not a feed.</h2><p>Soul Tribe reads how you connect and helps you discover people who match your depth, your rhythm, your way of being in the world.</p></div>
        <ul><li>Depth over breadth</li><li>Authenticity over performance</li><li>Presence over popularity</li><li>Belonging without conformity</li></ul>
      </section>
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeading}><h2>Your kind of people.<br/>Your kind of plans.</h2><p>Who you click with is personal. Soul Tribe brings together your interests, friendship preferences and social rhythm—then gives you somewhere to start.</p></div>
        <div className={styles.featureStory}>
          <article className={styles.storyRow}><div className={styles.storyVisual}><Phone screen="radar"/><p className={styles.caption}>Your home screen · On your Radar</p></div><div className={styles.storyCopy}><small>01 · YOUR SOCIAL READ</small><h3>A read on the way you move through friendship.</h3><p>Some people need constant contact. Some can disappear for weeks and come back like nothing happened. Some come alive around a crowded table; others need one good conversation in the corner.</p><p>Your Social Read brings together what you share: what draws you to people, what you value in friendship, your social rhythm and the things that make you want to leave the house.</p><strong>Six questions give us somewhere to start. Your Tribal Pass lets the picture get sharper over time.</strong></div></article>
          <article className={styles.storyRow}><div className={styles.storyVisual}><Phone screen="guests"/><p className={styles.caption}>Matched profiles in Invite Guests</p></div><div className={styles.storyCopy}><small>02 · MATCHING & RESONANCE</small><h3>Not everyone you like is like you.</h3><p>Sometimes you click because you move through the world in similar ways. Sometimes a difference gives you something worth exploring.</p><p>Soul Tribe uses the profile signals you share—your interests, friendship preferences, social rhythm and life context—to surface people worth meeting. Connection Notes help you see what connects you and where expectations differ.</p><strong>Not a compatibility percentage. A reason to look twice.</strong></div></article>
          <article className={styles.storyRow}><div className={styles.storyVisual}><Phone screen="invited"/><p className={styles.caption}>An invitation to spend time together</p></div><div className={styles.storyCopy}><small>03 · VIEW BOND</small><h3>See what exists between you.</h3><p>A profile tells you about a person. A Bond tells you about the two of you.</p><p>Open a Bond from a profile to explore where your patterns meet: what may feel easy, where you might rub, and what you could enjoy doing together. As you share more, there’s more to draw on.</p><strong>Knowing someone is interesting is different from knowing why the two of you might work.</strong></div></article>
          <article className={styles.storyRow}><div className={styles.storyVisual}><Phone screen="pitches"/><p className={styles.caption}>Your Pitches · Manage your outings</p></div><div className={styles.storyCopy}><small>04 · PITCH AN OUTING</small><h3>Have a plan.<br/>Missing the people?</h3><p>A gallery this afternoon. Padel tomorrow. Drinks after work. A beach day because Sunday suddenly opened up.</p><p>Pitch it when the thought happens. Choose what you’re doing, where, when and how many people you want around. Invite people or let them ask to join.</p><p>As requests come in, you decide who comes. Open their profile. See your Bond. Choose the group you want to bring together.</p><strong>The point isn’t to collect matches. It’s to give them somewhere to become real.</strong></div></article>
        </div>
        <p className={styles.caption}>App screenshots with member names and profile photos changed for privacy. Example outings, not live listings.</p>
      </section>
      <section id="how" className={styles.how}>
        <img className={styles.backdrop} src="/images/early-read/shore.jpg" alt="" loading="lazy"/>
        <div className={styles.sectionHeading}><h2>How it works</h2><p>A little self-understanding. A few people worth meeting. Something to do together.</p></div>
        <div className={styles.howPhones}><Phone screen="radar" className={styles.behind}/><Phone screen="pitches" className={styles.front}/></div>
        <div className={styles.steps}>{[
          ['01','First, a little about you.','Your Social Read.'],
          ['02','People worth looking twice at.','Resonance.'],
          ['03','See how your patterns meet.','Your Bond.'],
          ['04','Put a plan out there.','Pitch an Outing.']
        ].map(([n,t,p])=><article key={n}><small>{n}</small><h3>{t}</h3><p>{p}</p></article>)}</div><h2 className={styles.realLife}>The rest happens in real life.</h2>
      </section>
      <section className={styles.outingGallery}><div className={styles.sectionHeading}><h2>From an invitation<br/>to a shared memory.</h2><p>Your invitations, your pitches, and the evenings that already happened—all in one place.</p></div><div><Phone screen="invited"/><Phone screen="guests"/><Phone screen="past"/></div></section>
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
