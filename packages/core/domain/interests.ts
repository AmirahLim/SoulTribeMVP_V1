export interface InterestOptionNode {
  id: number;
  parentId: number;
  name: string;
  path: string;
}

export const ONBOARDING_INTEREST_NODES: InterestOptionNode[] = [
  { id: 101, parentId: 1, name: 'Coffee & wandering', path: 'food.coffee_wandering' },
  { id: 102, parentId: 1, name: 'Brunch', path: 'food.brunch' },
  { id: 103, parentId: 4, name: 'Workshops', path: 'creative.workshops' },
  { id: 104, parentId: 1, name: 'Food hunting', path: 'food.food_hunting' },
  { id: 105, parentId: 3, name: 'Bookshops', path: 'culture.bookshops' },
  { id: 106, parentId: 3, name: 'Museums & galleries', path: 'culture.museums_galleries' },
  { id: 107, parentId: 3, name: 'Live music', path: 'culture.live_music' },
  { id: 108, parentId: 1, name: 'Quiet drinks', path: 'food.quiet_drinks' },
  { id: 109, parentId: 5, name: 'Outdoor walks & nature', path: 'outdoors.walks_nature' },
  { id: 110, parentId: 2, name: 'Bouldering / movement', path: 'active.bouldering_movement' },
  { id: 111, parentId: 6, name: 'Board games', path: 'gaming.board_games' },
  { id: 112, parentId: 1, name: 'Cooking / dining at home', path: 'food.cooking_dining' },
  { id: 113, parentId: 4, name: 'Pottery / ceramics', path: 'creative.pottery_ceramics' },
  { id: 114, parentId: 1, name: 'Natural wine', path: 'food.natural_wine' },
  { id: 115, parentId: 3, name: 'Film & cinema', path: 'culture.film_cinema' },
];

export const ONBOARDING_INTEREST_OPTIONS: string[] = ONBOARDING_INTEREST_NODES.map((n) => n.name);

export function resolveInterestNodeId(name: string): number | null {
  const clean = name.trim().toLowerCase();
  const found = ONBOARDING_INTEREST_NODES.find((n) => n.name.toLowerCase() === clean);
  return found ? found.id : null;
}
