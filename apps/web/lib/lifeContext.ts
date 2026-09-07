export const LIFE_CONTEXTS = [
 'Building My Career','Building Something of My Own','Adventure Era','Wild & Free',
 'Slow Living','Settling Into Stability','Family Life','Travel & Exploring',
 'Reinvention/Healing','Running on Empty','More Time, More Freedom','Figuring It Out',
] as const;
export const LIFE_CONTEXT_DETAILS: Record<string,string> = {
 'Reinvention/Healing':'(changing career, city, lifestyle or chapter)',
 'Running on Empty':'(busy, burnt out, limited bandwidth)',
 'More Time, More Freedom':'(semi-retired, retired or flexible)',
 'Figuring It Out':'(between chapters, or don’t quite know yet)',
};
export function validLifeContexts(value:unknown,complete=false):value is string[] {
 return Array.isArray(value)&&value.length<4&&(!complete||value.length>0)&&new Set(value).size===value.length&&value.every(v=>LIFE_CONTEXTS.includes(v));
}
