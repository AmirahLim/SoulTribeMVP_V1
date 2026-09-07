const DB='soul-tribe-pending-photo';
const KEY='selected';
async function database():Promise<IDBDatabase> {
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB,1);
  request.onupgradeneeded=()=>request.result.createObjectStore('photos');
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(new Error('Photo could not be saved on this device.'));
 });
}
export async function pendingPhoto(file?:Blob|null):Promise<Blob|null> {
 const db=await database();
 try {return await new Promise((resolve,reject)=>{
  const tx=db.transaction('photos','readwrite');
  const store=tx.objectStore('photos');
  const req=file===undefined?store.get(KEY):file===null?store.delete(KEY):store.put({blob:file,expires:Date.now()+7*86400000},KEY);
  let value:Blob|null=null;
  req.onsuccess=()=>{if(file===undefined){if(req.result?.expires>Date.now())value=req.result.blob;else if(req.result)store.delete(KEY);}};
  tx.oncomplete=()=>resolve(value);
  tx.onerror=()=>reject(new Error('Photo could not be saved on this device.'));
  tx.onabort=()=>reject(new Error('Photo storage was interrupted.'));
 });} finally {db.close();}
}
