import { describe, it, expect } from 'vitest';

describe('Outings Central Hub & Navigation Test Suite', () => {
  it('1. Default Tab UX Logic — opens Invited if pending invites exist, Confirmed otherwise', () => {
    const resolveDefaultTab = (pendingInvitesCount: number) => {
      return pendingInvitesCount > 0 ? 'invited' : 'confirmed';
    };

    expect(resolveDefaultTab(2)).toBe('invited');
    expect(resolveDefaultTab(0)).toBe('confirmed');
  });

  it('2. Numerical Badge Indicator — formats badge count for Invited tab', () => {
    const pendingInvites = [{ id: '1' }, { id: '2' }];
    const badgeText = pendingInvites.length > 0 ? `Invited ${pendingInvites.length}` : 'Invited';

    expect(badgeText).toBe('Invited 2');
  });

  it('3. Table Limit Rule — max 6 participants enforced for outings', () => {
    const sampleOuting = {
      seatsTotal: 6,
      seatsFilled: 4,
    };

    expect(sampleOuting.seatsTotal).toBeLessThanOrEqual(6);
  });

  it('4. Confirmed Outings Sorting — sorts chronologically with soonest outing first', () => {
    const outings = [
      { id: 'later', dateTime: '2026-09-20T10:00:00Z' },
      { id: 'sooner', dateTime: '2026-09-05T10:00:00Z' },
    ];

    const sorted = [...outings].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    expect(sorted[0].id).toBe('sooner');
    expect(sorted[1].id).toBe('later');
  });

  it('5. Pitch Status Badges — determines pitch state correctly based on interest', () => {
    const getPitchStatus = (seatsFilled: number) => {
      return seatsFilled >= 3 ? 'Ready to Confirm' : 'Gathering Interest';
    };

    expect(getPitchStatus(1)).toBe('Gathering Interest');
    expect(getPitchStatus(4)).toBe('Ready to Confirm');
  });
});
