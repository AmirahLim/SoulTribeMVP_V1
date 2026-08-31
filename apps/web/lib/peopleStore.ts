export interface CandidatePerson {
  id: string;
  name: string;
  avatarUrl: string;
  homeArea: string;
  bio: string;
  interests: string[];
  clickText: string;
  rubText: string;
  rhythmOverlap: number;
  fitLabel: string;
}

export const CANDIDATE_PEOPLE: CandidatePerson[] = [
  {
    id: 'marcus-tan-101',
    name: 'Marcus Tan',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    homeArea: 'Tiong Bahru',
    bio: "Singapore-based. Looking for genuine, intentional friendships. I love quiet weekend wandering, pottery throwing, and deep conversations over filter coffee. Let's connect!",
    interests: ['Specialty Coffee', 'Ceramics', 'Independent Bookshops'],
    clickText: 'Both value quiet craft, intentional catch-ups, and slow coffee walks in Tiong Bahru.',
    rubText: 'Marcus prefers 3-4 days advance notice for weekend plans, while you enjoy occasional spontaneous outings.',
    rhythmOverlap: 88,
    fitLabel: 'Strong Fit',
  },
  {
    id: 'maya-lin-102',
    name: 'Maya Lin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    homeArea: 'Katong',
    bio: "Passionate about graphic design, sourdough baking, and coastal bike rides along East Coast Park.",
    interests: ['Design History', 'Sourdough Baking', 'East Coast Cycling'],
    clickText: 'High creative resonance and shared love for design history and food aesthetics.',
    rubText: 'Maya prefers quick daily text check-ins, whereas you prefer voice notes & deeper weekly catch-ups.',
    rhythmOverlap: 76,
    fitLabel: 'Moderate Fit',
  },
  {
    id: 'chen-wei-103',
    name: 'Chen Wei',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    homeArea: 'Bishan',
    bio: "Trail runner, architecture enthusiast, and quiet reader. Always down for early morning coffee walks.",
    interests: ['Trail Running', 'Architecture', 'Filter Coffee'],
    clickText: 'Shared commitment to reliability, punctuality, and grounded one-on-one conversations.',
    rubText: 'Chen Wei is an early riser (7am workouts), while your weekend rhythm starts a bit later.',
    rhythmOverlap: 64,
    fitLabel: 'Complementary Fit',
  },
];
