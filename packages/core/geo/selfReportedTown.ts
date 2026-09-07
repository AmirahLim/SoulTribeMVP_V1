import type {TraitGeography} from '../domain/types.ts';
export function hasKilometrePreference(g?:TraitGeography):boolean {
 return typeof g?.radius_km==='number'&&Number.isFinite(g.radius_km)&&g.radius_km>=1&&g.radius_km<=50;
}
const normalize=(s?:string)=>typeof s==='string'?s.trim().normalize('NFKC').toLowerCase().replace(/\s+/g,' '):'';
/** Same reported town label, not a verified place, distance or location. */
export function sameReportedTown(a?:TraitGeography,b?:TraitGeography):boolean {
 if(!hasKilometrePreference(a)||!hasKilometrePreference(b))return false;
 const town=normalize(a?.home_area),country=normalize(a?.country);
 return !!town&&!!country&&town===normalize(b?.home_area)&&country===normalize(b?.country);
}
/** Small, configurable preference only; never used as proof of radius compliance. */
export const SAME_REPORTED_TOWN_BOOST=0.02;
