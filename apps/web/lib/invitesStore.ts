'use client';

import { getGenderAvatarForName } from '@soul-tribe/core';

export interface PendingInviteItem {
  id: string;
  title: string;
  pitch: string;
  area: string;
  dateTime: string;
  hostName: string;
  hostAvatar: string;
  seatsTotal: number;
  seatsFilled: number;
  category: string;
  contextReason: string;
}

const DEFAULT_INVITES: PendingInviteItem[] = [
  {
    id: 'ubin-cycling-1',
    title: 'Pulau Ubin Cycling & Nature Trail',
    pitch: 'A morning ferry ride to Ubin followed by coastal trail cycling and coconut drink stops.',
    area: 'Pulau Ubin · Outdoor',
    dateTime: 'Sat, 12 Sep · 9:00 AM',
    hostName: 'Mervyn Tang',
    hostAvatar: getGenderAvatarForName('Mervyn Tang'),
    seatsTotal: 6,
    seatsFilled: 3,
    category: 'active',
    contextReason: 'Mervyn invited you based on your shared interest in Outdoor Exploration & quiet group walks.',
  },
  {
    id: 'cowboy-night-1',
    title: 'Cowboy Night & Country Saloon',
    pitch: 'A fun evening listening to country music and having craft beer in Clarke Quay.',
    area: 'Clarke Quay · Nightlife',
    dateTime: 'Fri, 18 Sep · 8:00 PM',
    hostName: 'Samuel Nair',
    hostAvatar: getGenderAvatarForName('Samuel Nair'),
    seatsTotal: 6,
    seatsFilled: 2,
    category: 'nightlife',
    contextReason: 'Samuel invited you based on your shared interest in Live Country Music & casual evening drinks.',
  },
];

const STORAGE_KEY = 'soul_tribe_pending_invites_v3';
const ACTIONED_KEY = 'soul_tribe_actioned_invites_v3';

export function getPendingInvitesLocal(): PendingInviteItem[] {
  if (typeof window === 'undefined') return DEFAULT_INVITES;
  try {
    const rawActioned = localStorage.getItem(ACTIONED_KEY);
    const actionedSet = new Set(rawActioned ? JSON.parse(rawActioned) : []);

    return DEFAULT_INVITES.filter((invite) => !actionedSet.has(invite.id));
  } catch {
    return DEFAULT_INVITES;
  }
}

export function actionInviteLocal(inviteId: string) {
  if (typeof window === 'undefined') return;
  try {
    const rawActioned = localStorage.getItem(ACTIONED_KEY);
    const actionedSet = new Set(rawActioned ? JSON.parse(rawActioned) : []);
    actionedSet.add(inviteId);
    localStorage.setItem(ACTIONED_KEY, JSON.stringify(Array.from(actionedSet)));

    // Notify listeners
    window.dispatchEvent(new Event('soul-tribe-invites-changed'));
  } catch (err) {
    console.error('Error actioning invite:', err);
  }
}
