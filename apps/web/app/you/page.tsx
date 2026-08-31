'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IllustratedGround, Bloom, SocialDnaBars, Button } from '@soul-tribe/ui';
import { Settings, RefreshCw, Clock, ShieldCheck, ArrowRight, Award, Sparkles, X, User, Camera } from 'lucide-react';
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
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-[#C85A32]"
          />
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#C85A32] uppercase">
              Tribal Pass · {profile.passCompletionPct}% Complete
            </span>
            <h1 className="text-[22px] font-extrabold tracking-tight text-[#1C2B22]">
              {profile.displayName}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="rounded-full border border-[#1C3A27]/10 bg-[#FFFDF9] p-2.5 text-[#3A4D42] hover:bg-[#EBDDD0]"
          title="Edit Profile & Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* REPUTATION & STANDING METRIC CARD */}
      <section className="mt-4 flex items-center justify-between rounded-[24px] border border-[#1C3A27]/15 bg-[#E1E8E3] p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C3A27] text-[#FFFDF9]">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#1C2B22]">Standing & Vouches</span>
              <span className="rounded-full bg-[#1C3A27] px-2 py-0.5 text-[10px] font-bold text-[#FFFDF9]">
                High Standing
              </span>
            </div>
            <p className="text-[12px] font-medium text-[#3A4D42]">6 Vouches & Kept RSVPs · 4 Bonds</p>
          </div>
        </div>

        <Link href="/mirror" className="text-[12px] font-bold text-[#1C3A27] hover:underline">
          View Standing →
        </Link>
      </section>

      {/* PART II — DEEPER TRIBAL PASS CARD */}
      <section className="mt-4 rounded-[24px] border border-[#C85A32]/20 bg-[#EBDDD0]/70 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#C85A32]">
            <Sparkles className="h-4.5 w-4.5" />
            <span className="text-[12px] font-bold uppercase tracking-wider">
              Part II — Deeper Tribal Pass
            </span>
          </div>
          <Link href="/you/deeper">
            <Button variant="primary" size="sm">
              Deepen Pass <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <p className="mt-1.5 text-[13px] font-medium leading-[19px] text-[#3A4D42]">
          Enrich your profile at your own pace across 10 progressive categories (A through J) to continuously refine recommendations.
        </p>
      </section>

      {/* FRIENDSHIP DNA BLOOM */}
      <section className="mt-5 flex flex-col items-center rounded-[28px] border border-[#1C3A27]/08 bg-[#FFFDF9] p-5 shadow-[0_8px_24px_-6px_rgba(28,58,39,0.06)]">
        <span className="text-[11px] font-bold tracking-wider text-[#6E7F75] uppercase">
          Interactive Friendship DNA
        </span>
        <p className="text-[12px] text-[#6E7F75]">Tap any petal to reveal your trait sentence</p>
        <div className="my-3">
          <Bloom dimensions={bloomDimensions} size={210} interactive={true} />
        </div>
      </section>

      {/* LAYER 2 PROFILE ARTIFACT NAVIGATION CARDS */}
      <section className="mt-5 grid grid-cols-2 gap-3">
        <Link href="/timeline" className="flex flex-col justify-between rounded-[24px] border border-[#1C3A27]/08 bg-[#FFFDF9] p-4 shadow-sm transition-all hover:bg-[#EBDDD0]/60">
          <div className="flex items-center gap-1.5 text-[#C85A32]">
            <Clock className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase">Timeline</span>
          </div>
          <h3 className="mt-2 text-[15px] font-extrabold text-[#1C2B22]">
            Tribe's Timeline
          </h3>
          <p className="mt-1 text-[11px] font-medium text-[#6E7F75]">Holds your history</p>
        </Link>

        <Link href="/mirror" className="flex flex-col justify-between rounded-[24px] border border-[#1C3A27]/08 bg-[#FFFDF9] p-4 shadow-sm transition-all hover:bg-[#EBDDD0]/60">
          <div className="flex items-center gap-1.5 text-[#1C3A27]">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase">Mirror</span>
          </div>
          <h3 className="mt-2 text-[15px] font-extrabold text-[#1C2B22]">
            Mirror-Profile
          </h3>
          <p className="mt-1 text-[11px] font-medium text-[#6E7F75]">Behavioral patterns</p>
        </Link>
      </section>

      {/* SOCIAL DNA INDEX BARS */}
      <section className="mt-5">
        <SocialDnaBars categories={socialDnaCategories} />
      </section>

      {/* EDIT PROFILE / SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[380px] rounded-[32px] border border-[#1C3A27]/10 bg-[#FFFDF9] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-5 right-5 text-[#6E7F75] hover:text-[#1C2B22]"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-[20px] font-bold text-[#1C2B22]">Edit Profile</h3>
            <p className="text-[12px] text-[#6E7F75]">Update your display name & profile photo</p>

            <form onSubmit={handleSaveSettings} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-bold text-[#1C2B22]">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 h-11 w-full rounded-[14px] border border-[#1C3A27]/15 bg-[#F6F1EA] px-4 text-[14px] font-medium text-[#1C2B22] outline-none"
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#1C2B22]">Profile Photo</label>
                <div className="mt-2 flex items-center gap-3">
                  <img src={editPhoto} alt="Preview" className="h-12 w-12 rounded-full object-cover" />
                  <label className="cursor-pointer rounded-[14px] border border-[#1C3A27]/15 bg-[#F6F1EA] px-3.5 py-1.5 text-[12px] font-bold text-[#1C2B22]">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    Change Image
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#1C2B22]">Singapore Area</label>
                <input
                  type="text"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="mt-1 h-11 w-full rounded-[14px] border border-[#1C3A27]/15 bg-[#F6F1EA] px-4 text-[14px] font-medium text-[#1C2B22] outline-none"
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#1C2B22]">Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="mt-1 w-full rounded-[14px] border border-[#1C3A27]/15 bg-[#F6F1EA] p-3 text-[13.5px] font-medium text-[#1C2B22] outline-none"
                />
              </div>

              <div className="mt-2 flex gap-2">
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
