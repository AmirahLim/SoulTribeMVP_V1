import type { Marker } from './markers.ts';

const rules = [
  { keys: ['novelty-seeking', 'advance-planning'], headline: 'Intentional explorer', title: 'You connect through', content: 'You seem to enjoy novelty without logistical uncertainty. A settled plan can give you room to explore somewhere unfamiliar and let conversation grow from the experience.' },
  { keys: ['intimate-group-oriented', 'depth-oriented'], headline: 'Room for real conversation', title: 'Who you are socially', content: 'A smaller setting and a meaningful topic may work together for you: fewer competing conversations can leave more room to follow one person’s ideas beyond introductions.' },
  { keys: ['depth-oriented', 'low-contact'], headline: 'Depth with breathing room', title: "You're at your best with", content: 'You appear to value meaningful connection without needing a continuous conversation. Friends who welcome depth when you reconnect may suit you better than assuming a quiet interval means lost interest.' },
  { keys: ['gradual-opening', 'advance-planning'], headline: 'Trust through returning', title: 'You bring to a friendship', content: 'Having another meeting in the calendar may give a slowly opening friendship continuity. Repeated time together could matter more than pressure to share everything at the first meeting.' },
  { keys: ['novelty-seeking', 'intimate-group-oriented'], headline: 'Small-circle discovery', title: "You're energized by", content: 'An unfamiliar experience with a few people may offer both discovery and enough space to notice each other. The invitation can be about trying something new together, rather than joining a crowd.' },
  { keys: ['gradual-opening', 'depth-oriented'], headline: 'Deep, but not immediately', title: 'You may lose energy when', content: 'Wanting depth does not necessarily mean wanting immediate disclosure. A conversation that pushes for personal details before familiarity has grown may feel less connecting than one that leaves you room to choose the pace.' },
];

/** Multiple labels from one answer do not constitute independent evidence. */
export function synthesizeSocialRead(markers: Marker[]) {
  const sections = rules.flatMap(rule => {
    const evidence = rule.keys.map(key => markers.find(m => m.key === key));
    if (evidence.some(m => !m)) return [];
    const sources = [...new Set(evidence.map(m => m!.source))];
    if (sources.length < 2) return [];
    const threads = [...new Set(evidence.map(m => m!.thread))];
    return [{ ...rule, markerCount: evidence.length, sources, threads,
      evidenceLevel: threads.length > 1 ? 'CROSS-THREAD PATTERN' : 'SUPPORTED INFERENCE' }];
  });
  return {
    headline: sections[0]?.headline ?? 'Your social story is unfolding',
    summary: sections[0]?.content ?? 'There is not yet enough independent evidence for a cross-Thread interpretation. Your answers are saved; this read will grow as you choose to share more.',
    pills: sections.slice(0, 3).map(p => p.headline),
    topThreads: [sections[0]?.threads[0] ?? 'personality', sections[0]?.threads[1] ?? 'communication'] as [string, string],
    sections,
  };
}
