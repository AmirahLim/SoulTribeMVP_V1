/**
 * Adapts a raw Supabase profiles row (with trait joins) into the shape
 * that toProfileVector expects.
 *
 * Shared by api/bond/route.ts and api/me/read/route.ts so the transform
 * is never duplicated.
 */
export function adaptRowToUserData(row: any): any {
  return {
    displayName: row.display_name,
    homeArea: row.home_area || 'Singapore',
    avatarUrl: row.avatar_url,
    bio: row.bio,
    birthYear: row.birth_year,
    agePrefMin: row.age_pref_min,
    agePrefMax: row.age_pref_max,
    trait_intent: Array.isArray(row.trait_intent) ? row.trait_intent[0] : row.trait_intent,
    trait_communication: Array.isArray(row.trait_communication) ? row.trait_communication[0] : row.trait_communication,
    trait_personality: Array.isArray(row.trait_personality) ? row.trait_personality[0] : row.trait_personality,
    trait_social_rhythm: Array.isArray(row.trait_social_rhythm) ? row.trait_social_rhythm[0] : row.trait_social_rhythm,
    trait_emotional: Array.isArray(row.trait_emotional) ? row.trait_emotional[0] : row.trait_emotional,
    trait_experience: Array.isArray(row.trait_experience) ? row.trait_experience[0] : row.trait_experience,
    trait_lifestyle: Array.isArray(row.trait_lifestyle) ? row.trait_lifestyle[0] : row.trait_lifestyle,
    trait_geography: Array.isArray(row.trait_geography) ? row.trait_geography[0] : row.trait_geography,
    user_interests: row.user_interests || [],
    user_values: row.user_values || [],
  };
}
