'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bloom, SocialDnaBars, Button } from '@soul-tribe/ui';
import { Settings, X, MessageSquare, Heart, Compass, Sparkles, User, Coffee, Smile } from 'lucide-react';
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
    <div className="relative min-h-screen w-full bg-[#0D1D15] text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND: YOUR UPLOADED ARTISTIC PAINTER EASEL PHOTO */}
      <img
        src="/user-you-bg.jpg"
        alt="You Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-45"
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

          <div className="mt-6 flex justify-center rounded-[24px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
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

          <div className="mt-4 rounded-[24px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
            <SocialDnaBars categories={socialDnaCategories} />
          </div>
        </section>

        {/* SECTION C: PUBLIC PROFILE ANSWERS & VERBATIM QUOTES */}
        <section className="py-6 flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Public Profile Voice
            </span>
            <h2 className="mt-1 text-[20px] font-bold text-white">
              What People See About You
            </h2>
            <p className="mt-1 text-[13.5px] text-white/80">
              Structured descriptors and your verbatim words rendered for matches.
            </p>
          </div>

          {/* 1. SOCIAL ENERGY */}
          <div className="rounded-[20px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <Smile className="h-4 w-4" />
              <h3 className="text-[15px] font-bold">Social Energy</h3>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-medium text-white">
                {deep.groupSize || 'Small groups (3–4)'}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-medium text-white">
                {deep.socialVibe || 'Playful-chaotic & Calm'}
              </span>
            </div>
            {deep.socialAtmosphereOpen && (
              <p className="mt-3 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{deep.socialAtmosphereOpen}”
              </p>
            )}
          </div>

          {/* 2. HOW I CONNECT */}
          <div className="rounded-[20px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <MessageSquare className="h-4 w-4" />
              <h3 className="text-[15px] font-bold">How I Connect</h3>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-medium text-white">
                {deep.messagingStyle || 'Voice notes & Memes'}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-medium text-white">
                {deep.supportStyle || 'Listen first'}
              </span>
            </div>
            {deep.messagingStyleOpen && (
              <p className="mt-3 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{deep.messagingStyleOpen}”
              </p>
            )}
          </div>

          {/* 3. FRIENDSHIP STYLE */}
          <div className="rounded-[20px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <Heart className="h-4 w-4" />
              <h3 className="text-[15px] font-bold">Friendship Style</h3>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-medium text-white">
                {deep.friendshipPillars || 'Comfortable silence & Reliability'}
              </span>
            </div>
            {deep.realFriendOpen && (
              <p className="mt-3 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{deep.realFriendOpen}”
              </p>
            )}
          </div>

          {/* 4. MY RHYTHM */}
          <div className="rounded-[20px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <Compass className="h-4 w-4" />
              <h3 className="text-[15px] font-bold">My Rhythm</h3>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-medium text-white">
                {deep.idealSaturday || 'Slow coffee & Hobbies'}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-medium text-white">
                {deep.spontaneousTrip || 'Convince me'}
              </span>
            </div>
            {deep.idealSaturdayOpen && (
              <p className="mt-3 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{deep.idealSaturdayOpen}”
              </p>
            )}
          </div>

          {/* 5. WHAT MATTERS */}
          <div className="rounded-[20px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-[15px] font-bold">What Matters</h3>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-medium text-white">
                {deep.coreValues || 'Curiosity · Growth · Freedom'}
              </span>
            </div>
            {deep.respectPeopleOpen && (
              <p className="mt-3 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “I really respect people who {deep.respectPeopleOpen}”
              </p>
            )}
          </div>

          {/* 6. YOU SHOULD KNOW */}
          <div className="rounded-[20px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <User className="h-4 w-4" />
              <h3 className="text-[15px] font-bold">You Should Know</h3>
            </div>
            {deep.likeMeIfPrompt && (
              <p className="mt-2.5 text-[13.5px] text-white">
                <span className="font-semibold text-white/80">I'll probably like you if:</span> “{deep.likeMeIfPrompt}”
              </p>
            )}
            {deep.quickestWayPrompt && (
              <p className="mt-2 text-[13.5px] text-white">
                <span className="font-semibold text-white/80">Quickest way to get me out:</span> “{deep.quickestWayPrompt}”
              </p>
            )}
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
