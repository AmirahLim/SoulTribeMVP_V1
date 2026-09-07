'use client';
import {useEffect,useState} from 'react';
import {pendingPhoto} from '../../lib/pendingProfilePhoto';
import {compressAndFormatImage} from '../../lib/avatarUpload';
export default function PhotoPicker({previewOnly=false}:{previewOnly?:boolean}) {
 const [photo,setPhoto]=useState<Blob|null>(null),[url,setUrl]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{if(!previewOnly)void pendingPhoto().then(setPhoto).catch(()=>setError('Choose your photo again on this device.'));},[previewOnly]);
 useEffect(()=>{if(!photo){setUrl('');return;}const u=URL.createObjectURL(photo);setUrl(u);return()=>URL.revokeObjectURL(u);},[photo]);
 async function select(file?:File) {
  if(!file)return;
  setError('');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){setError('Choose a JPG, PNG or WebP under 10 MB.');return;}
  setBusy(true);
  try {
   const image=await compressAndFormatImage(file,800,.8);
   if(!image.startsWith('data:image/jpeg;base64,'))throw new Error('Could not read this photo. Try another.');
   const blob=await(await fetch(image)).blob();
   if(blob.size>2*1024*1024)throw new Error('Please choose a smaller photo.');
   if(!previewOnly)await pendingPhoto(blob);
   setPhoto(blob);
  }catch(e){setError(e instanceof Error?e.message:'Could not save photo.');}
  finally{setBusy(false);}
 }
 return <div className="ob-photo-picker">
  <label htmlFor="onboarding-photo">Add a photo · Optional</label>
  {url&&<img src={url} alt="Your selected profile photo" width={88} height={88} style={{objectFit:'cover',borderRadius:'50%',margin:'12px 0'}} />}
  <input id="onboarding-photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>void select(e.target.files?.[0])}/>
  {photo&&<button type="button" disabled={busy} onClick={async()=>{try{if(!previewOnly)await pendingPhoto(null);setPhoto(null);}catch{setError('Could not remove the saved photo. Please retry.');}}}>Remove photo</button>}
  {busy&&<p role="status">Preparing photo…</p>}
  {error&&<p role="alert">{error}</p>}
 </div>;
}
