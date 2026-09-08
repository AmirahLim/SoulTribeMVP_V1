'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Users, Calendar, User } from 'lucide-react';
import { fetchInvitedOutings } from '../lib/outingsStore';
import { useAuth } from '../lib/authContext';
import { showAppNavigation } from '../lib/navigationVisibility';
import { subscribeOutingChanges } from '../lib/realtime';

export function Nav() {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [inviteError, setInviteError] = useState(false);

  const visible = showAppNavigation(pathname,Boolean(authUser));
  const userId = authUser?.id;

  useEffect(() => {
    let active = true;
    if (!visible) { setPendingCount(0); return; }
    async function updateCount() {
      try {
        if (userId) {
          const invited = await fetchInvitedOutings(userId);
          if (!active) return;
          setPendingCount(invited.length);
          setInviteError(false);
        } else {
          setPendingCount(0);
        }
      } catch {
        if (active) setInviteError(true);
      }
    }
    updateCount();
    const unsubscribe = userId ? subscribeOutingChanges({ table: 'outing_members', userId }, updateCount) : () => {};

    window.addEventListener('soul-tribe-invites-changed', updateCount);
    return () => { active = false; unsubscribe(); window.removeEventListener('soul-tribe-invites-changed', updateCount); };
  }, [pathname, userId, visible]);

  // App navigation belongs only to signed-in app routes, not acquisition/setup.
  if (!visible) {
    return null;
  }

  const items = [
    { href: '/home', label: 'Home', icon: Compass },
    { href: '/people', label: 'People', icon: Users },
    { href: '/outings', label: 'Outings', icon: Calendar, badge: pendingCount },
    { href: '/you', label: 'You', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center px-4 pb-5 pt-2">
      <div className="flex w-full max-w-[420px] items-center justify-around rounded-[999px] border border-white/20 bg-black/85 px-3 py-2 shadow-2xl backdrop-blur-xl">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[11px] font-bold transition-all ${
                isActive ? 'text-[#F5F2EA]' : 'text-[rgba(245,242,234,0.44)] hover:text-[#F5F2EA]'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.4] text-[#3D7A5A]' : 'stroke-[1.6]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#EFB94E] text-[9.5px] font-extrabold text-[#070908] shadow-md border border-[#070908] animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
              {item.href === '/outings' && inviteError && <span role="status" className="text-xs">Invitations unavailable</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
