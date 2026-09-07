'use client';
import React from 'react';
import { Settings } from 'lucide-react';
export interface ProfileHeroProps {
  displayName: string; handle: string; homeArea: string; bio?: string; avatarUrl?: string;
  passCompletionPct?: number; standingText?: string; instinctType?: string; instinctDescription?: string;
  onEditProfile?: () => void; onDeepenPass?: () => void;
}
export function ProfileHero({ displayName, handle, homeArea, bio, avatarUrl, passCompletionPct, onEditProfile, onDeepenPass }: ProfileHeroProps) {
  return <header className="space-y-6 py-4 text-[#203B30]">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#E3EADF] flex items-center justify-center text-2xl">
        {avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : (displayName || 'M').charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-widest text-[#536657]">Your profile</p>
        <h1 className="text-3xl font-semibold break-words">{displayName}</h1>
        <p className="text-sm text-[#536657] break-words">{[handle ? `@${handle}` : '', homeArea].filter(Boolean).join(' · ')}</p>
      </div>
      {onEditProfile && <button type="button" aria-label="Edit profile" onClick={onEditProfile} className="p-3 rounded-full border border-[#203B30]/20 focus-visible:outline focus-visible:outline-2"><Settings size={20} /></button>}
    </div>
    {bio?.trim() && <p className="text-sm leading-relaxed whitespace-pre-wrap">{bio}</p>}
    {typeof passCompletionPct === 'number' && <p className="text-xs text-[#536657]">Tribal Pass · {Math.round(Math.min(100, Math.max(0, passCompletionPct)))}% explored</p>}
    <div className="flex flex-wrap gap-3">
      <a href="/onboarding" className="flex-1 rounded-2xl border border-[#203B30]/20 px-4 py-3 text-sm text-center">Edit your answers</a>
      {onDeepenPass && <button type="button" onClick={onDeepenPass} className="flex-1 rounded-2xl bg-[#2D523E] text-[#F5F2EA] px-4 py-3 text-sm">Deepen your pass →</button>}
    </div>
  </header>;
}
