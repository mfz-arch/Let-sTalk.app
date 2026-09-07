'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Search, User as UserIcon } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-zinc-800 px-6 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-indigo-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
