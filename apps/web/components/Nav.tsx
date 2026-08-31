'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Users, Calendar, User } from 'lucide-react';

export function Nav() {
  const pathname = usePathname();

  // Hide nav on landing and onboarding routes
  if (pathname === '/' || pathname.startsWith('/onboarding')) {
    return null;
  }

  const items = [
    { href: '/home', label: 'Home', icon: Compass },
    { href: '/people', label: 'People', icon: Users },
    { href: '/outings/pitch', label: 'Outings', icon: Calendar },
    { href: '/you', label: 'You', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-[#F7F2EB]/90 px-4 pb-4 pt-2 backdrop-blur-md">
      <div className="flex w-full max-w-[420px] items-center justify-around rounded-[999px] border border-[#2D2118]/10 bg-[#FFFDF9] px-3 py-2 shadow-[0_8px_24px_-12px_rgba(45,33,24,0.18)]">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-all ${
                isActive ? 'text-[#C85A32]' : 'text-[#7A6B5F] hover:text-[#2D2118]'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
