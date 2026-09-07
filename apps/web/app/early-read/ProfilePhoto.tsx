'use client';
import {useState} from 'react';
import {getSupabaseBrowserClient} from '../../lib/supabase';
import {compressAndFormatImage} from '../../lib/avatarUpload';
import {setUserProfile} from '../../lib/userStore';

export default function ProfilePhoto({userId}:{userId:string}) {
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [url,setUrl]=useState('');
 async function upload(file:File|undefined) {
  if(!file)return;
  setError('');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024) {
   setError('Choose a JPG, PNG or WebP photo under 10 MB.');return;
  }
  setBusy(true);
  try {
   const client=getSupabaseBrowserClient();
   const {data:{user}}=await client.auth.getUser();
   if(user?.id!==userId)throw new Error('Please sign in again before uploading.');
   const data=await compressAndFormatImage(file,800,.8);
   if(!data.startsWith('data:image/jpeg;base64,'))throw new Error('Could not read this photo. Try another image.');
   const blob=await (await fetch(data)).blob();
   if(blob.size>2*1024*1024)throw new Error('Please choose a smaller photo.');
   const path=userId+'/avatar-'+crypto.randomUUID()+'.jpg';
   const result=await client.storage.from('avatars').upload(path,blob,{contentType:'image/jpeg',upsert:false});
   if(result.error)throw new Error('Your photo could not be uploaded. Please retry.');
   const publicUrl='/api/avatar/'+path;
   const saved=await client.from('profiles').update({avatar_url:publicUrl}).eq('id',userId).select('id').single();
   if(saved.error||!saved.data)throw new Error('Photo uploaded, but it could not be added to your profile. Please retry.');
   setUserProfile({avatarUrl:publicUrl});
   setUrl(publicUrl);
  } catch(e) {setError(e instanceof Error?e.message:'Unable to upload photo.');}
  finally {setBusy(false);}
 }
 return <section className="ob-fields" aria-labelledby="profile-photo-title">
  <h2 id="profile-photo-title">A face to say hello to.</h2>
  <p>Add a profile photo (optional). Other members can see it.</p>
  {url&&<img src={url} alt="Your profile photo" width={96} height={96} style={{borderRadius:'50%',objectFit:'cover'}} />}
  <label htmlFor="profile-photo">Upload photo</label>
  <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>void upload(e.target.files?.[0])} />
  <p role="status">{busy?'Uploading…':url?'Photo saved.':''}</p>
  {error&&<p role="alert">{error}</p>}
 </section>;
}
