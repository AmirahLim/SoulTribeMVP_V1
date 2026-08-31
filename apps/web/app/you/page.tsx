'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IllustratedGround, Bloom, SocialDnaBars, Button } from '@soul-tribe/ui';
import { Settings, X } from 'lucide-react';
import { getUserProfile, setUserProfile, UserProfileData } from '../../lib/userStore';

export default function ProfilePage() {
  const [profile, setProfileState] = useState<UserProfileData>({
    displayName: 'You',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    homeArea: 'Tiong Bahru',
    bio: 'Loves specialty coffee, ceramic craft, and analog film.',
    passCompletionPct: 72,
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

  const bloomDimensions = [
    { key: 'p', label: 'Personality', strength: 0.8, confidence: 0.9, sentence: 'You recharge in quiet spaces and go deep quickly.' },
    { key: 'c', label: 'Communication', strength: 0.7, confidence: 0.85, sentence: 'You reply within a day and prefer intentional messages.' },
    { key: 'r', label: 'Rhythm', strength: 0.6, confidence: 0.8, sentence: 'You prefer plans made a few days ahead on weekends.' },
    { key: 'i', label: 'Intent', strength: 0.9, confidence: 0.95, sentence: 'You are looking for a small, regular circle of close friends.' },
    { key: 'e', label: 'Emotional', strength: 0.75, confidence: 0.9, sentence: 'You open up gradually and stay loyal once comfortable.' },
    { key: 'int', label: 'Interests', strength: 0.85, confidence: 0.85, sentence: 'You love pottery, specialty coffee, and analog film.' },
    { key: 'v', label: 'Values', strength: 0.7, confidence: 0.8, sentence: 'Personal growth and creativity matter deeply to you.' },
    { key: 'l', label: 'Lifestyle', strength: 0.65, confidence: 0.75, sentence: 'You enjoy quiet dining and $20–50 low-key meetups.' },
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
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      {/* Top Bar Header */}
      <header className="flex items-center justify-between pb-6 border-b border-[#F3F0E9]/12">
        <div className="flex items-center gap-3">
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-[#F3F0E9]/30"
          />
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              Tribal Pass · {profile.passCompletionPct}% Complete
            </span>
            <h1 className="text-[22px] font-bold text-[#F3F0E9] tracking-tight">
              {profile.displayName}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="rounded-full border border-[#F3F0E9]/15 bg-[#15261C] p-2.5 text-[#F3F0E9] hover:bg-[#1C3325]"
          title="Edit Profile & Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* REPUTATION & STANDING METRIC */}
      <section className="py-5 border-b border-[#F3F0E9]/12">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-bold text-[#F3F0E9]">Standing & Vouches</span>
              <span className="text-[11px] font-bold text-[#016401]">High Standing</span>
            </div>
            <p className="mt-0.5 text-[12.5px] text-[#A6AAA4]">6 Vouches & Kept RSVPs · 4 Bonds</p>
          </div>

          <Link href="/mirror" className="text-[12.5px] font-semibold text-[#F3F0E9] hover:underline">
            View Standing →
          </Link>
        </div>
      </section>

      {/* PART II — DEEPER TRIBAL PASS */}
      <section className="py-5 border-b border-[#F3F0E9]/12">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
            Part II — Deeper Tribal Pass
          </span>
          <Link href="/you/deeper">
            <Button variant="secondary" size="sm">
              Deepen Pass →
            </Button>
          </Link>
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[#A6AAA4]">
          Enrich your profile across 10 progressive categories (A through J) to continuously refine recommendations.
        </p>
      </section>

      {/* FRIENDSHIP DNA BLOOM */}
      <section className="py-6 border-b border-[#F3F0E9]/12 flex flex-col items-center">
        <span className="text-[11px] font-bold tracking-widest text-[#A6AAA4] uppercase">
          Interactive Friendship DNA
        </span>
        <p className="mt-1 text-[12px] text-[#A6AAA4]">Tap any petal to reveal your trait sentence</p>
        <div className="my-4">
          <Bloom dimensions={bloomDimensions} size={210} interactive={true} />
        </div>
      </section>

      {/* LAYER 2 PROFILE ARTIFACT NAVIGATION */}
      <section className="py-6 border-b border-[#F3F0E9]/12 grid grid-cols-2 gap-4">
        <Link href="/timeline" className="group rounded-[20px] border border-[#F3F0E9]/12 bg-[#2B1A17] p-4">
          <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">Timeline</span>
          <h3 className="mt-1 text-[16px] font-bold text-[#F3F0E9] group-hover:underline">
            Tribe's Timeline
          </h3>
          <p className="mt-0.5 text-[12px] text-[#A6AAA4]">Holds your history</p>
        </Link>

        <Link href="/mirror" className="group rounded-[20px] border border-[#F3F0E9]/12 bg-[#2B1A17] p-4">
          <span className="text-[11px] font-bold tracking-widest text-[#016401] uppercase">Mirror</span>
          <h3 className="mt-1 text-[16px] font-bold text-[#F3F0E9] group-hover:underline">
            Mirror-Profile
          </h3>
          <p className="mt-0.5 text-[12px] text-[#A6AAA4]">Behavioral patterns</p>
        </Link>
      </section>

      {/* SOCIAL DNA INDEX BARS */}
      <section className="py-6">
        <SocialDnaBars categories={socialDnaCategories} />
      </section>

      {/* EDIT PROFILE / SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-[380px] border border-[#F3F0E9]/15 bg-[#2B1A17] p-6 rounded-[24px] shadow-2xl">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-5 right-5 text-[#A6AAA4] hover:text-[#F3F0E9]"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-[20px] font-bold text-[#F3F0E9]">Edit Profile</h3>
            <p className="text-[12px] text-[#A6AAA4]">Update your display name & profile photo</p>

            <form onSubmit={handleSaveSettings} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-semibold text-[#F3F0E9]">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[14px] text-[#F3F0E9] outline-none"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#F3F0E9]">Profile Photo</label>
                <div className="mt-2 flex items-center gap-3">
                  <img src={editPhoto} alt="Preview" className="h-12 w-12 rounded-full object-cover ring-1 ring-[#F3F0E9]" />
                  <label className="cursor-pointer rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-3.5 py-1.5 text-[12px] font-semibold text-[#F3F0E9]">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    Change Image
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#F3F0E9]">Singapore Area</label>
                <input
                  type="text"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="mt-1 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[14px] text-[#F3F0E9] outline-none"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#F3F0E9]">Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[13.5px] text-[#F3F0E9] outline-none"
                />
              </div>

              <div className="mt-3 flex gap-3">
                <Button type="button" variant="secondary" size="md" className="flex-1" onClick={() => setIsSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </IllustratedGround>
  );
}
