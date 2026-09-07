'use client';
import React, {useState} from 'react';
import Link from 'next/link';
import {Caveat} from 'next/font/google';
import styles from './MatchKeepsake.module.css';

const handwritten = Caveat({subsets: ['latin'], weight: ['400', '600']});
export type MatchKeepsakePerson = {
  id: string; name: string; avatarUrl?: string; homeArea?: string; bio?: string;
  clickText: string; rubText?: string; fitLabel?: string; isDemo?: boolean; provisional?: boolean;
};

export function MatchKeepsake({person}: {person: MatchKeepsakePerson}) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  return <article className={styles.card}>
    <header className={styles.header}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>A POSSIBLE CONNECTION</span>
        <h3>{person.name}</h3>
        {person.homeArea && <p className={styles.area}>{person.homeArea}</p>}
        <div className={styles.labels}>
          {person.isDemo && <span>Demo</span>}
          {person.fitLabel && <span>{person.fitLabel}</span>}
          {person.provisional && <span>Early read · still unfolding</span>}
        </div>
      </div>
      <Link href={`/people/${person.id}`} className={styles.portrait} aria-label={`View ${person.name}’s profile`}>
        {person.avatarUrl && failedPhoto !== person.avatarUrl ? <img src={person.avatarUrl} alt={`${person.name}’s profile photo`} loading="lazy" onError={() => setFailedPhoto(person.avatarUrl ?? null)}/> : <span className={styles.initial} aria-label="No profile photo">{person.name.slice(0, 1)}</span>}
      </Link>
    </header>
    <section className={styles.click}>
      <h4 className={handwritten.className}>Why you might click</h4>
      <p>{person.clickText || 'Your shared story is still taking shape as you both share more.'}</p>
    </section>
    <section className={styles.friction}>
      <h4>Potential friction</h4>
      <p>{person.rubText || 'There isn’t enough shared information to describe possible friction yet.'}</p>
    </section>
    {person.bio && <details className={styles.bio}><summary>A little about {person.name}</summary><p>{person.bio}</p></details>}
    <footer className={styles.actions}>
      <Link href={`/people/${person.id}/bond`}>View Connection <span aria-hidden="true">↗</span></Link>
      <Link href={`/people/${person.id}`}>View Profile <span aria-hidden="true">→</span></Link>
    </footer>
  </article>;
}
