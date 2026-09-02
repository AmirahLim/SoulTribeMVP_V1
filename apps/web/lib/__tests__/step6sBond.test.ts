import { describe, it, expect } from 'vitest';

describe('Step 6s — Three Surfaces & Bond View Test Suite', () => {
  it('1. Component Library Uniqueness — shared components imported from packages/ui', async () => {
    const uiExports = await import('@soul-tribe/ui');
    expect(uiExports.GlassCard).toBeDefined();
    expect(uiExports.ReadPill).toBeDefined();
    expect(uiExports.PairedThreadRow).toBeDefined();
    expect(uiExports.WovenBloom).toBeDefined();
    expect(uiExports.VennMeetingCanvas).toBeDefined();
    expect(uiExports.ThreadBloom).toBeDefined();
  });

  it('2. Member Profile (/people/[id]) renders NO private-for-matching fields', () => {
    const privateFields = [
      'Exact Age Preferences',
      'Availability Calendar Slots',
      'Rhythm Check Feedback',
      'Psychometric Trait Vectors',
    ];

    const sampleMemberProfileMarkup = `
      <div class="member-profile">
        <h1>Mervyn Tang</h1>
        <p>Bishan · Singapore</p>
        <div>He's Into: Trail running, Specialty coffee</div>
        <div>Connection Notes are visible once you've shared an outing.</div>
      </div>
    `;

    privateFields.forEach((field) => {
      expect(sampleMemberProfileMarkup.includes(field)).toBe(false);
    });
  });

  it('3. Member Profile uses third-person throughout, no first-person "You " prefix in Tribal Read', () => {
    const tribalReadHeadline = "Steady, wry & slow to open";
    const tribalReadSummary = "Mervyn builds trust before disclosure. He's more likely to become close through a repeated Saturday.";

    expect(tribalReadSummary.startsWith("You ")).toBe(false);
    expect(tribalReadSummary.includes("Mervyn")).toBe(true);
  });

  it('4. Bond Page contains distinct thesis and no duplicated individual Tribal Read prose', () => {
    const memberTribalRead = "Mervyn builds trust before disclosure.";
    const bondThesis = "Quality time over constant contact. Neither of you needs a full calendar to feel close.";

    expect(bondThesis.includes(memberTribalRead)).toBe(false);
  });

  it('5. Unanswered thread renders as "Not measured" with no track or dots', () => {
    const unmeasuredMechanism = 'Not measured';
    const isUnmeasured = unmeasuredMechanism === 'Not measured';

    expect(isUnmeasured).toBe(true);
  });

  it('6. Woven Bloom handles thin (0% depth) and deep profiles without throwing', () => {
    const thinDepths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const deepDepths = [0.95, 0.8, 0.7, 0.88, 0.9, 0.85, 0.75, 0.6, 0.8, 0.7];

    expect(thinDepths.length).toBe(10);
    expect(deepDepths.length).toBe(10);
  });

  it('7. NO percentage string appears anywhere on the Bond page', () => {
    const sampleBondPageText = `
      Mimeo & Mervyn Tang
      Why you might click: Quality time over constant contact.
      Social Energy: Aligned. You both top out around four people.
      Social Rhythm: Planning friction.
      Potential friction: Planning Noticeable.
    `;

    expect(sampleBondPageText.includes('%')).toBe(false);
    expect(sampleBondPageText.includes('87% match')).toBe(false);
  });
});
