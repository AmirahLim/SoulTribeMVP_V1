'use client';

export interface DeepProfileAnswers {
  // 1. Social Energy
  socialSetting?: string;
  socialEnergyOpen?: string;
  groupEnergy?: string;
  atmosphereOpen?: string;

  // 2. How I Connect
  connectionMode?: string;
  messagingStyleOpen?: string;
  replyRhythm?: string;
  supportOpen?: string;

  // 3. Friendship Style
  realFriendOpen?: string;
  bringsToFriendship?: string;
  caredForOpen?: string;
  independenceBalance?: string;

  // 4. My Rhythm
  timeAlive?: string;
  idealSaturdayOpen?: string;
  plansAheadHorizon?: string;
  idealHangLength?: string;

  // 5. Personality
  baliTextResponse?: string;
  unstructuredSaturdayOpen?: string;
  selfDescriptionOpen?: string;

  // 6. Values & Worldview
  mattersMost?: string;
  respectPeopleOpen?: string;
  worldviewSharing?: string;

  // 7. I'm Into
  genuinelyInto?: string[];
  talkForHoursOpen?: string;
  currentRabbitHoleOpen?: string;
  wantToTryOpen?: string;

  // 8. Outing DNA
  outingIngredients?: string[];
  instantYesOutingOpen?: string;
  adventureLevel?: string;
  comfortableSpend?: string;

  // 9. You Should Know
  likeYouIfOpen?: string;
  quickestOutHouseOpen?: string;
  weirdThingILoveOpen?: string;

  // 10. Boundaries & Matching
  punctualityImportance?: string;
  cancellationFeeling?: string;
  privateMatchingNotesOpen?: string;
}

export interface UserProfileData {
  displayName: string;
  avatarUrl: string;
  homeArea: string;
  bio: string;
  passCompletionPct: number;
  deepProfile?: DeepProfileAnswers;
}

const DEFAULT_USER_PROFILE: UserProfileData = {
  displayName: 'Priya Sharma',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  homeArea: 'Tiong Bahru',
  bio: 'Loves specialty coffee, ceramic craft, and analog film.',
  passCompletionPct: 85,
  deepProfile: {
    socialSetting: '3–4 people',
    socialEnergyOpen: 'I usually find one person I click with before I open up to the room.',
    groupEnergy: 'Listener · Connector',
    atmosphereOpen: 'Intimate, curious, slightly chaotic.',
    connectionMode: 'Voice notes · Memes · Mostly IRL',
    messagingStyleOpen: 'I don\'t need to talk every day to feel close, but when we talk I like actually talking.',
    replyRhythm: 'Same day',
    supportOpen: 'Listen first. Advice is welcome once I feel understood.',
    realFriendOpen: 'We can disappear into our own lives and reconnect without it feeling weird.',
    bringsToFriendship: 'Reliability · Adventures · Emotional support',
    caredForOpen: 'Making time · Remembering small details · Showing up',
    independenceBalance: 'Independent but deeply invested',
    timeAlive: 'Weekend afternoons',
    idealSaturdayOpen: 'Slow morning, something interesting in the afternoon, dinner if the energy is right.',
    plansAheadHorizon: '2–3 days ahead',
    idealHangLength: '2–3 hours · Somewhere we can actually talk',
    baliTextResponse: 'Convince me — adventurous but likes structure',
    selfDescriptionOpen: 'Curious, reflective, and independent with a subtle dry humor.',
    mattersMost: 'Curiosity · Freedom · Growth · Community',
    respectPeopleOpen: 'I really respect people who can change their mind when presented with better information.',
    worldviewSharing: 'Open-minded about differences; alignment matters on core values.',
    genuinelyInto: ['Art', 'Psychology', 'Travel', 'Ceramics'],
    talkForHoursOpen: 'Design history, why people make irrational choices, and filter coffee roast notes.',
    currentRabbitHoleOpen: 'Japanese woodworking joints and studio ghibli food aesthetics.',
    wantToTryOpen: 'Pottery throwing and bouldering.',
    outingIngredients: ['Culture', 'Food', 'Nature', 'Learning'],
    instantYesOutingOpen: 'A quiet pottery workshop followed by filter coffee in Tiong Bahru.',
    adventureLevel: 'Will absolutely try something new',
    comfortableSpend: '$20–50',
    likeYouIfOpen: 'I\'ll probably like you if you can go from discussing something stupid to something existential in 5 mins.',
    quickestOutHouseOpen: 'A quiet coffee walk or an invitation to a bookstore.',
    weirdThingILoveOpen: 'The smell of old books and watching pottery glaze dry.',
    punctualityImportance: 'Essential',
    cancellationFeeling: 'Dislike — notice feels respectful',
  },
};

export function getUserProfile(): UserProfileData {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const saved = localStorage.getItem('soul_tribe_user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_USER_PROFILE,
        ...parsed,
        deepProfile: {
          ...DEFAULT_USER_PROFILE.deepProfile,
          ...(parsed.deepProfile || {}),
        },
      };
    }
  } catch (e) {
    console.error('Failed to read user profile', e);
  }
  return DEFAULT_USER_PROFILE;
}

export function setUserProfile(data: Partial<UserProfileData>): UserProfileData {
  const current = getUserProfile();
  const updated = {
    ...current,
    ...data,
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
