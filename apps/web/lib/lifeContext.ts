export const LIFE_CONTEXTS = [
 'Building My Career','Building Something of My Own','Adventure Era','Wild & Free',
 'Slow Living','Settling Into Stability','Family Life','Travel & Exploring',
 'Reinvention/Healing','Running on Empty','More Time, More Freedom','Figuring It Out',
] as const;
export const LIFE_CONTEXT_DETAILS: Record<string,string> = {
 'Wild & Free':'Nightlife, events, lots happening',
 'Reinvention/Healing':'Changing career, city, lifestyle or chapter',
 'Running on Empty':'Busy, burnt out, limited bandwidth',
 'More Time, More Freedom':'Semi-retired, retired or flexible',
 'Figuring It Out':'Between chapters, or don’t quite know yet',
};
export function validLifeContexts(value:unknown,complete=false):value is string[] {
 return Array.isArray(value)&&value.length<4&&(!complete||value.length>0)&&new Set(value).size===value.length&&value.every(v=>LIFE_CONTEXTS.includes(v));
}
