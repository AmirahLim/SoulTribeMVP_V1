'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Calendar, User } from 'lucide-react';
import { FeatherLogo } from '@soul-tribe/ui';

export function Nav() {
  const pathname = usePathname();

  // Hide nav on landing and onboarding routes
  if (pathname === '/' || pathname.startsWith('/onboarding')) {
    return null;
  }

  const items = [
    { href: '/home', label: 'Home', isLogo: true },
    { href: '/people', label: 'People', icon: Users },
    { href: '/outings/pitch', label: 'Outings', icon: Calendar },
    { href: '/you', label: 'You', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center px-4 pb-4 pt-2">
      <div className="flex w-full max-w-[420px] items-center justify-around rounded-[999px] border border-[#2D523E]/12 bg-[#FFFDF9]/95 px-3 py-2 shadow-[0_12px_32px_-8px_rgba(45,82,62,0.18)] backdrop-blur-md">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[11px] font-bold transition-all ${
                isActive ? 'text-[#2D523E]' : 'text-[#7A6B5F] hover:text-[#2D523E]'
              }`}
            >
              {item.isLogo ? (
                <FeatherLogo size={18} />
              ) : (
                Icon && <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
