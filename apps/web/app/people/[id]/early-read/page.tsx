'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {AuthGuard} from '../../../../components/AuthGuard';
import {EarlyReadAlbum} from '../../../../components/profile/EarlyReadAlbum';
import {emptyDraft, type BaselineDraft} from '../../../../lib/sixQuestionOnboarding';
import {getSupabaseBrowserClient} from '../../../../lib/supabase';
import catalog from '../../../../lib/onboardingQuestionCatalog.json';
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
    const client=getSupabaseBrowserClient();
    Promise.all([
      client.from('profiles').select('id,display_name,handle').eq('id',id).maybeSingle(),
      client.from('read_answer_sources').select('question_id,question_version,dimension,selections').eq('user_id',id).eq('access','public'),
    ]).then(([{data,error},sources])=>{
        if (!active) return;
        if(error||sources.error){setStatus('The Early Read could not be loaded. Please refresh to retry.');return;}
        if(!data){setStatus('Early Read unavailable.');return;}
        const answers:Record<string,unknown>={},records:Record<string,unknown>={};
        for(const source of sources.data??[]){
          const question=catalog.find(q=>q.questionId===source.question_id&&q.fields[0]===source.dimension);
          if(!question)continue;
          const value=['connectionChoice','planningChoice','punctualityChoice'].includes(source.dimension)?source.selections[0]:source.selections;
          answers[source.dimension]=value;
          if(source.question_version===question.questionVersion)records[question.questionId]={questionId:question.questionId,questionVersion:source.question_version,answer:{[source.dimension]:value}};
        }
        answers.answerRecords=records;
        setProfile({...data,public_onboarding:answers} as SharedProfile);setStatus('');
      }).catch(()=>{if(active)setStatus('The Early Read could not be loaded. Please refresh to retry.');});
    return () => { active = false; };
  }, [id]);

  const answers = profile?.public_onboarding ?? {};
  const hasSharedAnswers = Object.keys(answers).some(key=>key!=='answerRecords');
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
              <h2>No supported Early Read yet.</h2>
              <p>There are no saved, visible baseline selections to read from yet.</p>
            </section>}
      </>}
    </div>
  </main>;
}
