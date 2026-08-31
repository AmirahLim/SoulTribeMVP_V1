'use client';

export interface UserProfileData {
  displayName: string;
  avatarUrl: string;
  homeArea: string;
  bio: string;
  passCompletionPct: number;
}

const DEFAULT_USER_PROFILE: UserProfileData = {
  displayName: 'Priya Sharma',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  homeArea: 'Tiong Bahru',
  bio: 'Loves specialty coffee, ceramic craft, and analog film.',
  passCompletionPct: 72,
};

export function getUserProfile(): UserProfileData {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const saved = localStorage.getItem('soul_tribe_user_profile');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to read user profile', e);
  }
  return DEFAULT_USER_PROFILE;
}

export function setUserProfile(data: Partial<UserProfileData>): UserProfileData {
  const current = getUserProfile();
  const updated = { ...current, ...data };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('soul_tribe_user_profile', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  }
  return updated;
}
