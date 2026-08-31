'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bloom, SocialDnaBars, Button } from '@soul-tribe/ui';
import { Settings, X, MessageSquare, Heart, Compass, Sparkles, User, Coffee, Smile, Radio, Share2, Quote } from 'lucide-react';
import { getUserProfile, setUserProfile, UserProfileData } from '../../lib/userStore';

export default function ProfilePage() {
  const [profile, setProfileState] = useState<UserProfileData>({
    displayName: 'You',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    homeArea: 'Tiong Bahru',
    bio: 'Loves specialty coffee, ceramic craft, and analog film.',
    passCompletionPct: 85,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  useEffect(() => {
    const loaded = getUserProfile();
    setProfileState(loaded);
    setEditName(loaded.displayName);
    setEditArea(loaded.homeArea);
    setEditBio(loaded.bio);
    setEditPhoto(loaded.avatarUrl);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = setUserProfile({
      displayName: editName.trim() || 'You',
      homeArea: editArea,
      bio: editBio,
      avatarUrl: editPhoto,
    });
    setProfileState(updated);
    setIsSettingsOpen(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const deep = profile.deepProfile || {};

  const bloomDimensions = [
    { key: 'p', label: 'Personality', strength: 0.8, confidence: 0.9, sentence: deep.selfDescriptionOpen || 'Curious, reflective, and independent.' },
    { key: 'c', label: 'Communication', strength: 0.7, confidence: 0.85, sentence: deep.messagingStyleOpen || 'Prefers intentional messages & voice notes.' },
    { key: 'r', label: 'Rhythm', strength: 0.6, confidence: 0.8, sentence: deep.idealSaturdayOpen || 'Slow mornings, afternoons for exploring.' },
    { key: 'i', label: 'Intent', strength: 0.9, confidence: 0.95, sentence: deep.realFriendOpen || 'Looking for a small, regular inner circle.' },
    { key: 'e', label: 'Emotional', strength: 0.75, confidence: 0.9, sentence: deep.supportOpen || 'Listen first. Advice once understood.' },
    { key: 'int', label: 'Interests', strength: 0.85, confidence: 0.85, sentence: deep.talkForHoursOpen || 'Art, ceramics, psychology, travel.' },
    { key: 'v', label: 'Values', strength: 0.7, confidence: 0.8, sentence: deep.respectPeopleOpen || 'Respects people who change their mind.' },
    { key: 'l', label: 'Lifestyle', strength: 0.65, confidence: 0.75, sentence: deep.instantYesOutingOpen || 'Enjoys $20–50 low-key coffee and craft meetups.' },
  ];

  const socialDnaCategories = [
    { key: 'personality', name: 'Personality', score: 80 },
    { key: 'communication', name: 'Communication', score: 90 },
    { key: 'rhythm', name: 'Social Rhythm', score: 70 },
    { key: 'intent', name: 'Friendship Intent', score: 100 },
    { key: 'emotional', name: 'Emotional Style', score: 80 },
    { key: 'interests', name: 'Interests', score: 65 },
    { key: 'values', name: 'Values', score: 90 },
    { key: 'lifestyle', name: 'Lifestyle', score: 75 },
  ];

  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND: YOUR UPLOADED ARTISTIC PAINTER EASEL PHOTO */}
      <img
        src="/user-you-bg.jpg"
        alt="You Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-80"
      />

      {/* Dark Ambient Vignette Overlay for Readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        {/* Top Bar Header */}
        <header className="flex items-center justify-between pb-6 border-b border-white/15">
          <div className="flex items-center gap-3">
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white/30"
            />
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Tribal Pass · {profile.passCompletionPct}% Complete
              </span>
              <h1 className="text-[22px] font-extrabold text-white tracking-tight drop-shadow-md">
                {profile.displayName}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-full border border-white/20 bg-black/50 p-2.5 text-white hover:bg-black/70 backdrop-blur-md"
            title="Edit Profile & Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </header>

        {/* REPUTATION & STANDING METRIC */}
        <section className="py-6 border-b border-white/15">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Tribe Standing
            </span>
            <span className="text-[12px] font-semibold text-white">
              Good Citizen
            </span>
          </div>

          <p className="mt-2 text-[14px] leading-relaxed text-white/90">
            {profile.bio || 'Loves specialty coffee, ceramic craft, and analog film.'}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[12.5px] text-white/80">
              <strong className="text-white font-semibold">{profile.homeArea}</strong> · Singapore
            </div>

            <Link href="/you/deeper">
              <Button variant="secondary" size="sm">
                Deepen Tribal Pass →
              </Button>
            </Link>
          </div>
        </section>

        {/* SECTION A: FRIENDSHIP DNA BLOOM */}
        <section className="py-6 border-b border-white/15">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Friendship DNA Bloom
            </span>
            <span className="text-[11px] text-white/70">7 Dimensions</span>
          </div>

          <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/90">
            A dynamic visual representation of your social energy, rhythm, and values.
          </p>

          <div className="mt-6 flex justify-center rounded-[24px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <Bloom dimensions={bloomDimensions} size={280} interactive />
          </div>
        </section>

        {/* SECTION B: SOCIAL DNA METRIC BARS */}
        <section className="py-6 border-b border-white/15">
          <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
            Social DNA Breakdown
          </span>
          <p className="mt-1 text-[13.5px] text-white/90">
            Trait vectors calculated from your questionnaire responses.
          </p>

          <div className="mt-4 rounded-[24px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <SocialDnaBars categories={socialDnaCategories} />
          </div>
        </section>

        {/* SECTION C: VISUAL SIGNALS DIAGRAM MAP (REPLACES BOXES) */}
        <section className="py-6 flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Public Signals
            </span>
            <h2 className="mt-1 text-[20px] font-bold text-white">
              Visual Profile Map
            </h2>
            <p className="mt-1 text-[13.5px] text-white/80">
              Diagrammatic overview of your social rhythm, energy, and communication style.
            </p>
          </div>

          {/* DIAGRAM 1: SOCIAL ENERGY SPECTRUM GAUGE */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase flex items-center gap-1.5">
                <Smile className="h-4 w-4 text-white" /> 01 / Social Energy Spectrum
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/30">
                {deep.groupSize || '3–4 people'}
              </span>
            </div>

            {/* Visual Gauge Scale Bar */}
            <div className="mt-4 relative pt-2">
              <div className="flex justify-between text-[11.5px] font-semibold text-white/70">
                <span>Quiet & Intimate</span>
                <span>High Energy & Lively</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-white/10 relative overflow-hidden border border-white/20">
                <div className="h-full bg-gradient-to-r from-white/40 via-white to-white/70 w-[35%] rounded-full" />
              </div>
              <div className="mt-1.5 flex justify-between text-[10.5px] text-white/60">
                <span>One-on-one</span>
                <span className="text-white font-bold">▲ Ideal (3–4)</span>
                <span>Big Parties</span>
              </div>
            </div>

            {deep.socialAtmosphereOpen && (
              <div className="mt-4 rounded-[16px] border border-white/15 bg-white/10 p-3 text-[13px] italic text-white/90">
                “{deep.socialAtmosphereOpen}”
              </div>
            )}
          </div>

          {/* DIAGRAM 2: COMMUNICATION RHYTHM NODE GRAPH */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-white" /> 02 / Communication Rhythm Nodes
            </span>

            {/* Visual Connected Nodes Diagram */}
            <div className="mt-4 flex items-center justify-around py-3 border-y border-white/15">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="h-10 w-10 rounded-full border border-white/30 bg-white/20 flex items-center justify-center font-bold text-white text-[12px]">
                  🎙️
                </div>
                <span className="text-[11.5px] font-semibold text-white">Voice Notes</span>
              </div>

              <div className="h-0.5 w-8 bg-gradient-to-r from-white/30 via-white to-white/30" />

              <div className="flex flex-col items-center gap-1 text-center">
                <div className="h-10 w-10 rounded-full border border-white/30 bg-white/20 flex items-center justify-center font-bold text-white text-[12px]">
                  💬
                </div>
                <span className="text-[11.5px] font-semibold text-white">Memes & Check-ins</span>
              </div>

              <div className="h-0.5 w-8 bg-gradient-to-r from-white/30 via-white to-white/30" />

              <div className="flex flex-col items-center gap-1 text-center">
                <div className="h-10 w-10 rounded-full border border-white/30 bg-white/20 flex items-center justify-center font-bold text-white text-[12px]">
                  ☕
                </div>
                <span className="text-[11.5px] font-semibold text-white">Mostly IRL</span>
              </div>
            </div>

            {deep.messagingStyleOpen && (
              <div className="mt-4 rounded-[16px] border border-white/15 bg-white/10 p-3 text-[13px] italic text-white/90">
                “{deep.messagingStyleOpen}”
              </div>
            )}
          </div>

          {/* DIAGRAM 3: FRIENDSHIP DUAL-AXIS BALANCE SCALE */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-white" /> 03 / Friendship Balance Scale
            </span>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[18px] border border-white/15 bg-white/10 p-3 text-center">
                <span className="text-[10px] font-bold text-white/70 uppercase">Pillar A</span>
                <p className="mt-1 text-[13px] font-bold text-white">Comfortable Silence</p>
              </div>

              <div className="rounded-[18px] border border-white/15 bg-white/10 p-3 text-center">
                <span className="text-[10px] font-bold text-white/70 uppercase">Pillar B</span>
                <p className="mt-1 text-[13px] font-bold text-white">Reliability & Trust</p>
              </div>
            </div>

            {deep.realFriendOpen && (
              <div className="mt-4 rounded-[16px] border border-white/15 bg-black/40 p-3 text-[13px] text-white/90">
                <span className="font-semibold text-white/80">I know we're actually friends when:</span> “{deep.realFriendOpen}”
              </div>
            )}
          </div>

          {/* DIAGRAM 4: VALUES CONSTELLATION GRAPH */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-white" /> 04 / Core Values Constellation
            </span>

            {/* Glowing Value Cloud */}
            <div className="mt-4 flex flex-wrap justify-center gap-2.5 py-2">
              {['Curiosity', 'Freedom', 'Growth', 'Community', 'Authenticity'].map((val, idx) => (
                <span
                  key={val}
                  className="rounded-full border border-white/30 bg-gradient-to-r from-white/20 to-white/10 px-4 py-1.5 text-[13px] font-bold text-white backdrop-blur-md shadow-md"
                >
                  ✨ {val}
                </span>
              ))}
            </div>

            {deep.respectPeopleOpen && (
              <div className="mt-4 rounded-[16px] border border-white/15 bg-white/10 p-3 text-[13px] italic text-white/90">
                “I really respect people who {deep.respectPeopleOpen}”
              </div>
            )}
          </div>

          {/* DIAGRAM 5: VERBATIM VOICE & CONVERSATION HOOKS */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden">
            <Quote className="absolute right-3 top-3 h-16 w-16 opacity-10 text-white pointer-events-none" />

            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase flex items-center gap-1.5">
              <User className="h-4 w-4 text-white" /> 05 / Conversation Starters
            </span>

            <div className="mt-4 flex flex-col gap-3">
              <div className="rounded-[16px] border border-white/15 bg-black/40 p-3">
                <span className="text-[11px] font-bold text-white/70 uppercase">I'll probably like you if...</span>
                <p className="mt-1 text-[13px] text-white">“{deep.likeMeIfPrompt || 'You can switch from silly memes to deep topics in 5 mins.'}”</p>
              </div>

              <div className="rounded-[16px] border border-white/15 bg-black/40 p-3">
                <span className="text-[11px] font-bold text-white/70 uppercase">Quickest way to get me out...</span>
                <p className="mt-1 text-[13px] text-white">“{deep.quickestWayPrompt || 'Mention a quiet coffee walk or an invitation to a bookstore.'}”</p>
              </div>
            </div>
          </div>
        </section>

        {/* EDIT PROFILE SETTINGS MODAL */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="relative w-full max-w-[400px] rounded-[28px] border border-white/20 bg-black/80 p-6 text-white shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <h2 className="text-[18px] font-bold">Edit Profile Settings</h2>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="mt-4 flex flex-col gap-4">
                {/* Photo Preview & Custom Upload */}
                <div className="flex items-center gap-4">
                  <img
                    src={editPhoto}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div className="flex flex-col gap-1">
                    <label className="cursor-pointer text-[12.5px] font-bold text-white underline">
                      Upload Custom Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-white/60">
                      Upload any photo from your device
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[12.5px] font-semibold text-white/80">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 h-10 w-full rounded-[12px] border border-white/20 bg-black/60 px-3 text-[14px] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[12.5px] font-semibold text-white/80">Home Area</label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="mt-1 h-10 w-full rounded-[12px] border border-white/20 bg-black/60 px-3 text-[14px] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[12.5px] font-semibold text-white/80">Bio</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="mt-1 w-full rounded-[12px] border border-white/20 bg-black/60 p-2.5 text-[13.5px] text-white outline-none"
                  />
                </div>

                <div className="mt-2 flex gap-3 pt-2 border-t border-white/15">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setIsSettingsOpen(false)} className="w-1/2">
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="w-1/2">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
