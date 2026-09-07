import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './landing.module.css';

function CTA({children='Find your people'}:{children?:React.ReactNode}) {
  return <Link className={styles.cta} href="/onboarding">{children}<ArrowRight size={16} aria-hidden="true"/></Link>;
}
function Avatar({variant=0}:{variant?:number}) {
  return <svg viewBox="0 0 64 64" className={styles.demoAvatar} role="img" aria-label="Fictional illustrated avatar"><rect width="64" height="64" rx="32" fill={variant?'#b0a78a':'#83958a'}/><path d="M8 64c0-26 48-26 48 0" fill={variant?'#465d51':'#e9dfcc'}/><ellipse cx="32" cy="28" rx="14" ry="17" fill={variant?'#a76e51':'#d8a789'}/><path d={variant?'M17 27Q12 2 34 8Q51 8 47 30L39 17L18 26':'M17 31Q9 6 32 6Q55 8 47 39L43 20Q29 24 21 18Z'} fill="#36342c"/></svg>;
}
function Demo({kind}:{kind:'read'|'match'|'bond'|'pitch'|'radar'}) {
  return <div className={styles.demoUI}><small>SOUL TRIBE · FICTIONAL DEMO</small>
    {kind==='read'?<><h4>Your Social Read</h4><div className={styles.demoIdentity}><Avatar/><span>Alex Rowan<br/><small>Your Social Signature</small></span></div><div className={styles.demoPanel}><em>A little more you.</em><p>You value friendship with room to breathe. A thoughtful check-in means more to you than a running conversation.</p><p>Shared curiosity gives you a reason to go out—and something to talk about.</p></div><div className={styles.demoPills}><span>Thoughtful check-ins</span><span>Small groups</span></div><p>Tribal Pass · Keep exploring →</p></>
    :kind==='match'?<><h4>People worth a second look.</h4>{['Alex Rowan','Robin Vale'].map((name,i)=><div className={styles.demoPanel} key={name}><div className={styles.demoIdentity}><Avatar variant={i}/><span>{name}<br/><small>Singapore · Demo profile</small></span></div><p>{i?'A gallery, a good question, an unhurried afternoon.':'Long walks. Small tables. Something new to learn.'}</p><div className={styles.demoPills}><span>{i?'Art & curiosity':'Quiet company'}</span><span>View Bond ↗</span></div></div>)}</>
    :kind==='bond'?<><h4>Your Bond</h4><div className={styles.demoIdentity}><Avatar/><span>Alex & Robin</span><Avatar variant={1}/></div><svg viewBox="0 0 240 100" className={styles.weave} aria-hidden="true">{[0,1,2,3,4,5].map(i=><path key={i} d={'M0 '+(15+i*12)+' C70 -20 170 130 240 '+(15+i*12)} fill="none" stroke={i%2?'#b6c7ac':'#cfb58e'} strokeWidth="2"/>)}</svg><div className={styles.demoPanel}><small>WHERE YOU MEET</small><p>Space between messages. Curiosity when you meet.</p><small>A DIFFERENCE TO NOTICE</small><p>One likes a plan; one leaves room for a detour.</p><small>SOMETHING TO SHARE</small><p>A gallery afternoon, then a long coffee.</p></div></>
    :kind==='radar'?<><h4>On your Radar</h4><p>Plans for your interests & social rhythm.</p><div className={styles.demoPanel}><img className={styles.demoLandscape} src="/images/early-read/shore.jpg" alt="An evening by the water"/><h4>A walk, then dinner?</h4><p>Friday · 6:30 pm · Singapore</p><div className={styles.demoIdentity}><Avatar variant={1}/><span>Hosted by Robin<br/><small>Illustrative outing</small></span></div><span className={styles.demoAction}>View outing →</span></div></>
    :<><h4>Your Pitch</h4><div className={styles.demoPanel}><small>GATHERING INTEREST</small><h4>A gallery this afternoon?</h4><p>2:00 pm · Singapore · 4 places</p><small>JOIN REQUESTS · DEMO</small>{['Robin Vale','Alex Rowan'].map((name,i)=><div className={styles.demoRequest} key={name}><div className={styles.demoIdentity}><Avatar variant={1-i}/><span>{name}</span></div><div className={styles.demoPills}><span>View Bond ↗</span><span>Approve</span></div></div>)}</div><p>You choose who comes.</p></>}
  </div>;
}
function Phone({screen,className=''}:{screen:'pitches'|'radar';className?:string}) {
  return <div className={styles.phone+' '+className}><div className={styles.screen}><Demo kind={screen==='pitches'?'pitch':'radar'}/></div></div>;
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
        <div className={styles.featureStory}>
          <article className={styles.storyRow}><div className={styles.storyVisual}><Demo kind="read"/></div><div className={styles.storyCopy}><small>01 · YOUR SOCIAL READ</small><h3>A read on the way you move through friendship.</h3><p>Some people need constant contact. Some can disappear for weeks and come back like nothing happened. Some come alive around a crowded table; others need one good conversation in the corner.</p><p>Your Social Read brings together what you share: what draws you to people, what you value in friendship, your social rhythm and the things that make you want to leave the house.</p><strong>Six questions give us somewhere to start. Your Tribal Pass lets the picture get sharper over time.</strong></div></article>
          <article className={styles.storyRow}><div className={styles.storyVisual}><Demo kind="match"/></div><div className={styles.storyCopy}><small>02 · MATCHING & RESONANCE</small><h3>Not everyone you like is like you.</h3><p>Sometimes you click because you move through the world in similar ways. Sometimes a difference gives you something worth exploring.</p><p>Soul Tribe uses the profile signals you share—your interests, friendship preferences, social rhythm and life context—to surface people worth meeting. Connection Notes help you see what connects you and where expectations differ.</p><strong>Not a compatibility percentage. A reason to look twice.</strong></div></article>
          <article className={styles.storyRow}><div className={styles.storyVisual}><Demo kind="bond"/></div><div className={styles.storyCopy}><small>03 · VIEW BOND</small><h3>See what exists between you.</h3><p>A profile tells you about a person. A Bond tells you about the two of you.</p><p>Open a Bond from a profile to explore where your patterns meet: what may feel easy, where you might rub, and what you could enjoy doing together. As you share more, there’s more to draw on.</p><strong>Knowing someone is interesting is different from knowing why the two of you might work.</strong></div></article>
          <article className={styles.storyRow}><div className={styles.storyVisual}><Demo kind="pitch"/></div><div className={styles.storyCopy}><small>04 · PITCH AN OUTING</small><h3>Have a plan.<br/>Missing the people?</h3><p>A gallery this afternoon. Padel tomorrow. Drinks after work. A beach day because Sunday suddenly opened up.</p><p>Pitch it when the thought happens. Choose what you’re doing, where, when and how many people you want around. Invite people or let them ask to join.</p><p>As requests come in, you decide who comes. Open their profile. See your Bond. Choose the group you want to bring together.</p><strong>The point isn’t to collect matches. It’s to give them somewhere to become real.</strong></div></article>
        </div>
        <p className={styles.caption}>Illustrative product previews with fictional names and illustrated avatars. No real member profiles are shown.</p>
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
