// Generic stopwords & outing noise words to strip for distinctive query extraction
const STOPWORDS = new Set([
  'night', 'meetup', 'session', 'hangout', 'outing', 'gathering', 'club', 'group',
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'for', 'with', 'by', 'about',
  'discussion', 'walk', 'talk', 'crawl', 'meet', 'join', 'let', 'lets', 'singapore', 'sg'
]);

export function extractDistinctiveQuery(
  title?: string,
  pitch?: string,
  interestNode?: string,
  category?: string
): string {
  // 1. Distinctive words from Title
  if (title) {
    const titleWords = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w));
    if (titleWords.length > 0) {
      return titleWords.join(' ');
    }
  }

  // 2. Distinctive words from Pitch
  if (pitch) {
    const pitchWords = pitch
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w));
    if (pitchWords.length > 0) {
      return pitchWords.slice(0, 3).join(' ');
    }
  }

  // 3. Interest Node Name
  if (interestNode && interestNode.trim()) {
    return interestNode.trim();
  }

  // 4. Activity Category
  if (category && category.trim()) {
    return category.trim();
  }

  return '';
}
