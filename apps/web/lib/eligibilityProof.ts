import {createHmac,timingSafeEqual} from 'node:crypto';
export const ELIGIBILITY_COOKIE='st_adult_eligibility';
export function makeProof(token:string,year:number):string {
 const payload=year+'.'+(Date.now()+7*86400000);
 return payload+'.'+createHmac('sha256',token).update(payload).digest('hex');
}
export function readProof(token:string,value:string|undefined):number|null {
 if(!value||!/^\d{4}\.\d{13}\.[a-f0-9]{64}$/.test(value))return null;
 const [year,expiry,signature]=value.split('.');
 const expected=createHmac('sha256',token).update(year+'.'+expiry).digest();
 if(Number(expiry)<Date.now()||!timingSafeEqual(expected,Buffer.from(signature,'hex')))return null;
 return Number(year);
}
