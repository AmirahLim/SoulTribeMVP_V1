'use client';

export interface DeepProfileAnswers {
  // 1. Social Energy
  groupSize?: string;
  socialVibe?: string;
  socialAtmosphereOpen?: string;

  // 2. How I Connect
  messagingStyle?: string;
  supportStyle?: string;
  messagingStyleOpen?: string;

  // 3. Friendship Style
  friendshipPillars?: string;
  realFriendOpen?: string;

  // 4. My Rhythm
  idealSaturday?: string;
  spontaneousTrip?: string;
  idealSaturdayOpen?: string;

  // 5. Personality (MBTI & Astrology Big 3)
  selfDescriptionOpen?: string;
  mbti?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;

  // 6. Values & Worldview
  coreValues?: string;
  respectPeopleOpen?: string;

  // 7. I'm Into
  talkForHoursOpen?: string;
  currentRabbitHoleOpen?: string;

  // 8. Outing DNA
  budgetPref?: string;
  instantYesOutingOpen?: string;

  // 9. You Should Know
  likeMeIfPrompt?: string;
  quickestWayPrompt?: string;

  // 10. Boundaries & Matching
  punctualityPref?: string;
  cancellationStance?: string;
}

export interface UserProfileData {
  version?: number;
  displayName: string;
  avatarUrl: string;
  homeArea: string;
  bio: string;
  passCompletionPct: number;
  hasCompletedOnboarding?: boolean;
  completedCategoryNums?: number[];
  deepProfile?: DeepProfileAnswers;
}

export interface JoinedGuest {
  id: string;
  name: string;
  avatarUrl: string;
  homeArea: string;
  status: 'Confirmed' | 'Pending';
}

export interface PitchedOuting {
  id: string;
  title: string;
  pitch: string;
  area: string;
  dateTime: string;
  hostName: string;
  hostAvatar: string;
  seatsTotal: number;
  seatsFilled: number;
  cohesionScore: number;
  joinedGuests: JoinedGuest[];
  createdAt: string;
}

export function calculatePassCompletion(hasOnboarded: boolean = true, completedCategoryNums: number[] = []): number {
  if (!hasOnboarded) return 0;
  const uniqueCats = new Set(completedCategoryNums);
  const count = uniqueCats.size;
  const pct = 10 + count * 9;
  return Math.min(100, pct);
}

export const DEFAULT_USER_PROFILE: UserProfileData = {
  version: 3,
  displayName: 'Priya Sharma',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  homeArea: 'Tiong Bahru',
  bio: 'Loves specialty coffee, ceramic craft, and analog film.',
  passCompletionPct: 10,
  hasCompletedOnboarding: true,
  completedCategoryNums: [],
  deepProfile: {
    groupSize: '3–4 people',
    socialVibe: 'Intimate · Calm',
    socialAtmosphereOpen: 'I usually find one person I click with before I open up to the room.',
    messagingStyle: 'Voice notes · Memes',
    supportStyle: 'Listen first',
    messagingStyleOpen: 'I don\'t need to talk every day to feel close, but when we talk I like actually talking.',
    friendshipPillars: 'Comfortable silence · Reliability',
    realFriendOpen: 'We can disappear into our own lives and reconnect without it feeling weird.',
    idealSaturday: 'Slow coffee & Hobbies',
    spontaneousTrip: 'Convince me',
    idealSaturdayOpen: 'Slow morning, something interesting in the afternoon, dinner if the energy is right.',
    selfDescriptionOpen: 'Curious, reflective, and independent with a subtle dry humor.',
    mbti: 'INFJ',
    sunSign: 'Scorpio',
    moonSign: 'Cancer',
    risingSign: 'Leo',
    coreValues: 'Curiosity · Freedom · Growth · Community',
    respectPeopleOpen: 'I really respect people who can change their mind when presented with better information.',
    talkForHoursOpen: 'Design history, why people make irrational choices, and filter coffee roast notes.',
    currentRabbitHoleOpen: 'Japanese woodworking joints and studio ghibli food aesthetics.',
    budgetPref: '$20–50',
    instantYesOutingOpen: 'A quiet pottery workshop followed by filter coffee in Tiong Bahru.',
    likeMeIfPrompt: 'I\'ll probably like you if you can go from discussing something stupid to something existential in 5 mins.',
    quickestWayPrompt: 'A quiet coffee walk or an invitation to a bookstore.',
    punctualityPref: 'Essential',
    cancellationStance: 'Dislike — notice feels respectful',
  },
};

export const DEFAULT_PITCHES: PitchedOuting[] = [
  {
    id: 'pitch-101',
    title: 'Saturday Pottery & Filter Coffee',
    pitch: "Let's spend two hours throwing clay at Tiong Bahru Studios, followed by a quiet filter coffee to talk properly.",
    area: 'Tiong Bahru',
    dateTime: 'Sat 14 Sep · 3:00pm',
    hostName: 'Priya Sharma',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    seatsTotal: 6,
    seatsFilled: 4,
    cohesionScore: 88,
    joinedGuests: [
      {
        id: 'p2',
        name: 'Marcus Tan',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        homeArea: 'Tiong Bahru',
        status: 'Confirmed',
      },
      {
        id: 'p3',
        name: 'Maya Lin',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        homeArea: 'Katong',
        status: 'Confirmed',
      },
      {
        id: 'p4',
        name: 'Chen Wei',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        homeArea: 'Bishan',
        status: 'Confirmed',
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

export function getUserProfile(): UserProfileData {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const saved = localStorage.getItem('soul_tribe_user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.version !== 3) {
        parsed.version = 3;
        parsed.deepProfile = {
          ...DEFAULT_USER_PROFILE.deepProfile,
          ...(parsed.deepProfile || {}),
        };
      }

      const completedCats = parsed.completedCategoryNums !== undefined
        ? parsed.completedCategoryNums
        : [];
      const hasOnboarded = parsed.hasCompletedOnboarding ?? true;
      const calculatedPct = calculatePassCompletion(hasOnboarded, completedCats);

      const result: UserProfileData = {
        ...DEFAULT_USER_PROFILE,
        ...parsed,
        version: 3,
        passCompletionPct: calculatedPct,
        completedCategoryNums: completedCats,
        hasCompletedOnboarding: hasOnboarded,
        deepProfile: {
          ...DEFAULT_USER_PROFILE.deepProfile,
          ...(parsed.deepProfile || {}),
        },
      };

      localStorage.setItem('soul_tribe_user_profile', JSON.stringify(result));
      return result;
    }
  } catch (e) {
    console.error('Failed to read user profile', e);
  }
  return DEFAULT_USER_PROFILE;
}

export function setUserProfile(data: Partial<UserProfileData>): UserProfileData {
  const current = getUserProfile();
  const completedCats = data.completedCategoryNums !== undefined
    ? data.completedCategoryNums
    : (current.completedCategoryNums || []);
  const hasOnboarded = data.hasCompletedOnboarding !== undefined
    ? data.hasCompletedOnboarding
    : (current.hasCompletedOnboarding ?? true);

  const calculatedPct = calculatePassCompletion(hasOnboarded, completedCats);

  const updated: UserProfileData = {
    ...current,
    ...data,
    version: 3,
    passCompletionPct: calculatedPct,
    completedCategoryNums: completedCats,
    hasCompletedOnboarding: hasOnboarded,
    deepProfile: {
      ...(current.deepProfile || {}),
      ...(data.deepProfile || {}),
    },
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('soul_tribe_user_profile', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  }
  return updated;
}

export function getUserPitches(): PitchedOuting[] {
  if (typeof window === 'undefined') return DEFAULT_PITCHES;
  try {
    const saved = localStorage.getItem('soul_tribe_user_pitches');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read user pitches', e);
  }
  return DEFAULT_PITCHES;
}

export function addUserPitch(newPitch: PitchedOuting): PitchedOuting[] {
  const current = getUserPitches();
  const updated = [newPitch, ...current];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('soul_tribe_user_pitches', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save user pitch', e);
    }
  }
  return updated;
}
