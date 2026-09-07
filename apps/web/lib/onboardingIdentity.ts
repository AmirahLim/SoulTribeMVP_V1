export const AGE_BANDS = ['18–24', '25–34', '35–44', '45–54', '55+'] as const;
import {validLifeContexts} from './lifeContext';
export type IdentityDetails = { setupRevision?: 1 | 2; lifeContexts?: string[]; ageBand?: string; ageOther?: string; country?: string; travelKm?: number };
export function validIdentity(d: IdentityDetails & {area: string}, complete = false): boolean {
  if (d.setupRevision === undefined) return true;
  if (d.setupRevision !== 1 && d.setupRevision !== 2) return false;
  if (d.setupRevision === 2) {
    return validLifeContexts(d.lifeContexts,complete) && validIdentity({...d,setupRevision:1,ageBand:'18–24',ageOther:''},complete);
  }
  const bounded = (s: unknown, max: number) => typeof s === 'string' && s.length <= max && !/[\u0000-\u001f\u007f]/.test(s);
  if (!bounded(d.area,100) || !bounded(d.country,80) || !bounded(d.ageOther,3)) return false;
  if (!['', 'Other', ...AGE_BANDS].includes(d.ageBand ?? 'invalid')) return false;
  if (!Number.isInteger(d.travelKm) || d.travelKm! < 1 || d.travelKm! > 50) return false;
  if (d.ageOther && (!/^\d{2,3}$/.test(d.ageOther) || Number(d.ageOther)<18 || Number(d.ageOther)>120)) return false;
  return !complete || (!!d.area.trim() && !!d.country?.trim() && !!d.ageBand && (d.ageBand !== 'Other' || !!d.ageOther));
}
