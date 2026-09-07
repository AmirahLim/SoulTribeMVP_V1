'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {AuthGuard} from '../../../../components/AuthGuard';
import {EarlyReadAlbum} from '../../../../components/profile/EarlyReadAlbum';
import {emptyDraft, type BaselineDraft} from '../../../../lib/sixQuestionOnboarding';
import {getSupabaseBrowserClient} from '../../../../lib/supabase';
import styles from './PublicEarlyRead.module.css';

type SharedProfile = {
  id: string;
  display_name: string;
  handle: string;
  public_onboarding?: Record<string, unknown>;
};

function sharedDraft(answers: Record<string, unknown>): BaselineDraft {
  return {...emptyDraft(), ...answers, step: 7};
}

export default function PublicEarlyReadPage() {
  return <AuthGuard><PublicEarlyReadContent /></AuthGuard>;
}

function PublicEarlyReadContent() {
  const {id} = useParams<{id: string}>();
  const [profile, setProfile] = useState<SharedProfile | null>(null);
  const [status, setStatus] = useState('Loading Early Read…');

  useEffect(() => {
    let active = true;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      setStatus('Early Read unavailable.');
      return;
    }
    // Read only the member's consent-gated public snapshot. Private answers stay private.
    getSupabaseBrowserClient().from('profiles')
      .select('id,display_name,handle,public_onboarding')
      .eq('id', id).maybeSingle()
      .then(({data, error}) => {
        if (!active) return;
        if (error || !data) setStatus('Early Read unavailable.');
        else { setProfile(data as SharedProfile); setStatus(''); }
      });
    return () => { active = false; };
  }, [id]);

  const answers = profile?.public_onboarding ?? {};
  const hasSharedAnswers = Object.keys(answers).length > 0;
  return <main className={styles.page}>
    <div className={styles.shell}>
      <Link className={styles.back} href={profile ? `/people/${profile.id}` : '/people'}>← Back to profile</Link>
      {!profile && <p role="status" className={styles.status}>{status}</p>}
      {profile && <>
        <header className={styles.header}>
          <p>SOUL TRIBE / EARLY READ</p>
          <h1>{profile.display_name}</h1>
          <p><span>Unique username</span> @{profile.handle.replace(/^@/, '')}</p>
        </header>
        {hasSharedAnswers
          ? <EarlyReadAlbum draft={sharedDraft(answers)} />
          : <section className={styles.unshared}>
              <p>EARLY READ</p>
              <h2>This page is still private.</h2>
              <p>{profile.display_name} has not chosen to share their onboarding answers.</p>
            </section>}
      </>}
    </div>
  </main>;
}
