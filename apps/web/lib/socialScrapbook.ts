/** Presentation-only adapters. Public profiles accept only their public projection. */
export type SocialPage = {
  key: string; title: string; caption: string; notes: string[];
  kind: 'paper' | 'notebook' | 'photo' | 'letter';
  href?: string; action?: string;
};
type Thread = {key: string; status: string; note?: string; descriptor?: string[]};
type Read = {
  threads: Thread[];
  tribalRead?: {headline: string; summary: string; sections: {title: string; content: string; markerCount: number}[]};
  values: {label: string}[]; interests: {name: string}[];
  tension?: {headline: string; explanation: string};
  boundaries?: Record<string, string | undefined>;
  connectionNotes?: {hook: string; statement: string; explanation: string}[];
  outingPreferences?: {instantYes?: string; usuallyYes?: string[]; convinceMe?: string[]};
};
export const brief = (text: string, limit = 130) => {
  if (text.length <= limit) return text;
  const words = text.slice(0, limit).split(' '); words.pop();
  return `${words.join(' ')}…`;
};
const clean = (items: (string | undefined)[]) => items.filter((v): v is string => !!v?.trim());
export function selfSocialPages(read: Read): SocialPage[] {
  const notes = (...keys: string[]) => read.threads.filter(t => t.status === 'known' && keys.includes(t.key)).flatMap(t => clean([t.note]));
  const supported = read.tribalRead?.sections.filter(s => s.markerCount >= 2) ?? [];
  const page = (key: string, title: string, caption: string, kind: SocialPage['kind'], content: string[]): SocialPage => ({key, title, caption, kind, notes: content, href: '/you/deeper', action: 'Explore this a little deeper →'});
  return [
    page('social', 'Who I am socially', 'A little portrait of me', 'photo', clean([read.tribalRead?.summary, ...notes('personality', 'intent')])),
    page('connect', 'My kind of closeness', 'How I naturally connect', 'notebook', notes('communication', 'social_rhythm', 'emotional')),
    page('bring', 'What I bring', 'The things I hold close', 'letter', [
      ...supported.filter(s => /bring|strength|offer/i.test(s.title)).map(s => s.content),
      ...clean([read.values.length ? `Qualities I value in friendship: ${read.values.map(v => v.label).join(' · ')}` : undefined]),
    ]),
    page('best', 'Where I come alive', 'People, places & a little ease', 'photo', [...supported.filter(s => /best with/i.test(s.title)).map(s => s.content), ...notes('experience', 'lifestyle', 'geography')]),
    page('friction', 'Handle with care', 'What can feel a little harder', 'paper', clean([read.tension?.headline, read.tension?.explanation, ...Object.values(read.boundaries ?? {})])),
    page('doing', 'Count me in for…', 'Less scrolling, more doing', 'notebook', clean([
      read.interests.length ? `I'm into ${read.interests.map(i => i.name).join(' · ')}` : undefined,
      read.outingPreferences?.instantYes && `An easy yes: ${read.outingPreferences.instantYes}`,
      read.outingPreferences?.usuallyYes?.length ? `Usually yes: ${read.outingPreferences.usuallyYes.join(' · ')}` : undefined,
      read.outingPreferences?.convinceMe?.length ? `Depends on the plan: ${read.outingPreferences.convinceMe.join(' · ')}` : undefined,
    ])),
    {key: 'between', title: 'Me, in good company', caption: 'When two ways of being meet', kind: 'letter',
      notes: read.connectionNotes?.flatMap(n => [n.statement, n.explanation]) ?? [], href: '/people', action: 'Find someone & view your Bond →'},
  ];
}
export function sharedChoices(answers: Record<string, unknown> | undefined, key: string, other = ''): string[] {
  const raw = answers?.[key] ?? (key === 'groupChoices' ? answers?.group : undefined);
  return (Array.isArray(raw) ? raw : [raw]).filter((v): v is string => typeof v === 'string' && !!v.trim())
    .flatMap(v => v === 'Other' ? (typeof answers?.[other] === 'string' ? [answers[other] as string] : []) : [v]);
}
export function publicSocialPages(answers: Record<string, unknown> | undefined, values: string[], id: string): SocialPage[] {
  const line = (key: string, label: string, other = '') => { const v = sharedChoices(answers, key, other); return v.length ? [`${label}: ${v.join(' · ')}`] : []; };
  return [
    {key: 'social', title: 'A little about them', caption: 'What they’re looking for', kind: 'photo', notes: line('intent', 'Looking for', 'intentOther')},
    {key: 'connect', title: 'Their kind of closeness', caption: 'How they like to connect', kind: 'notebook', notes: [...line('clicks', 'Connection moments', 'clicksOther'), ...line('connectionChoice', 'Keeping in touch', 'connectionOther'), ...line('planningChoice', 'Making plans', 'planningOther')]},
    {key: 'bring', title: 'What matters to them', caption: 'Values, in their own words', kind: 'letter', notes: values.length ? [values.join(' · ')] : []},
    {key: 'best', title: 'Where they feel at home', caption: 'People & settings they enjoy', kind: 'photo', notes: [...line('groupChoices', 'Social settings'), ...line('desiredQualities', 'Qualities they look for in friends', 'qualityOther')]},
    {key: 'friction', title: 'Handle with care', caption: 'Making room for differences', kind: 'paper', notes: line('punctualityChoice', 'How they feel about timing', 'punctualityOther'), href: `/people/${id}/bond`, action: 'Explore your differences in View Bond →'},
    {key: 'doing', title: 'Count them in for…', caption: 'Something to do together', kind: 'notebook', notes: line('outings', 'Their kind of outing', 'outingOther'), href: `/outings/pitch?inviteId=${id}`, action: 'Invite them to an outing →'},
    {key: 'between', title: 'The space between you', caption: 'Not just them. The two of you.', kind: 'letter', notes: ['A Bond explores where your patterns meet, what might feel easy, and where you may need to make room for each other.'], href: `/people/${id}/bond`, action: 'View Bond →'},
  ];
}
