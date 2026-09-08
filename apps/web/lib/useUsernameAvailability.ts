'use client';
import {useEffect,useState} from 'react';
import {checkHandleAvailability} from './supabaseAuth';
import {validateHandle} from './userStore';

export function useUsernameAvailability(username:string, enabled:boolean, accountId?:string) {
 const [result,setResult]=useState({username:'',available:false,message:''});
 useEffect(()=>{
  if(!enabled)return;
  let active=true;
  const value=username.trim().toLowerCase();
  const validation=validateHandle(value);
  setResult({username:value,available:false,message:value?(validation.valid?'Checking username availability…':validation.error!):'Choose your public username.'});
  if(!validation.valid)return;
  const timer=setTimeout(async()=>{
   const check=await checkHandleAvailability(value,accountId);
   if(active)setResult({username:value,available:check.available,message:check.available?`@${value} is available. It is reserved when your account is saved.`:check.message!});
  },450);
  return()=>{active=false;clearTimeout(timer);};
 },[username,enabled,accountId]);
 return result.username===username.trim().toLowerCase()?result:{username,available:false,message:'Checking username availability…'};
}
