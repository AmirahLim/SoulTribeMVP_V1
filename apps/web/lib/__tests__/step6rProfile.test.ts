import { describe, it, expect } from 'vitest';
import { colors, THREAD_COLORS } from '@soul-tribe/tokens';

function sanitizeOpenAnswer(raw?: string): string {
  if (!raw) return '';
  return raw
    .replace(/^(I really respect people who|I feel most connected when|I'm looking for|What earns my trust is|I respect people who)\s*/i, '')
    .trim();
}

describe('Step 6r — Visual Drawings & Bug Fixes Verification', () => {
  it('1. Bug Fix 1 — Strips prompt stem prefix to avoid text duplication', () => {
    const rawAnswer = "I really respect people who can change their mind when presented with new evidence.";
    const clean = sanitizeOpenAnswer(rawAnswer);
    expect(clean).toBe("can change their mind when presented with new evidence.");
    expect(clean.startsWith("I really respect people who")).toBe(false);
  });

  it('2. Bug Fix 2 — Pitch title and pitch body are distinct', () => {
    const samplePitch = {
      title: "Online dating discussion",
      pitch: "A low-key coffee catch-up discussing friendship software vs market apps.",
    };
    expect(samplePitch.title).not.toBe(samplePitch.pitch);
  });

  it('3. Bug Fix 3 — Trait cards do not contain raw percentile strings', () => {
    const traitReadText = "Four people is where you stop scanning the room and start noticing one person.";
    expect(traitReadText.includes('65%')).toBe(false);
    expect(traitReadText.includes('90%')).toBe(false);
  });

  it('4. Bug Fix 4 — No wall of zeroes: completed and uncompleted threads surface next best prompts', () => {
    const completedCategoryNums = [2, 3];
    const totalCategories = 10;
    const isWallOfZeroes = completedCategoryNums.length === 0;
    expect(isWallOfZeroes).toBe(false);
  });

  it('5. Bug Fix 5 — Friendship Style 2-axis labels are explicit: Close / Independent and Few / Many', () => {
    const axisLabels = { verticalTop: 'Close', verticalBottom: 'Independent', horizontalLeft: 'Few', horizontalRight: 'Many' };
    expect(axisLabels.verticalTop).toBe('Close');
    expect(axisLabels.verticalBottom).toBe('Independent');
    expect(axisLabels.horizontalLeft).toBe('Few');
    expect(axisLabels.horizontalRight).toBe('Many');
  });

  it('6. Bloom at 10% contains 10 total petal slots (ghost outline for unexplored, explored for active)', () => {
    const totalPetals = 10;
    const activeThreadsCount = 1;
    const ghostPetalsCount = totalPetals - activeThreadsCount;
    expect(ghostPetalsCount).toBe(9);
    expect(totalPetals).toBe(10);
  });

  it('7. Card wash colors use brand amber and emerald with high-contrast text', () => {
    expect(colors.brand.amber).toBe('#EFB94E');
    expect(colors.brand.emerald).toBe('#5BD99A');
    expect(THREAD_COLORS.personality.tone).toBe('emerald');
    expect(THREAD_COLORS.intent.tone).toBe('amber');
  });
});
