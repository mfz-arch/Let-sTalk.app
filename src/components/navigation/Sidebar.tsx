'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Search, User as UserIcon, PlusCircle, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStories } from '../../context/StoryContext';
import { Avatar } from '../common/Avatar';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { openStoryCreator } = useStories();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-[#12141a] border-r border-white/[0.07] px-4 py-5 justify-between flex-shrink-0 z-30">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center space-x-3 px-2 py-1 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-zinc-100 group-hover:text-white transition-colors">
              Let'sTalk
            </h1>
            <p className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold -mt-0.5">Social Messenger</p>
          </div>
        </Link>

        {/* Quick Action: Share Story */}
        <button
          onClick={openStoryCreator}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 font-semibold text-xs tracking-wide transition-all active:scale-[0.98] shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-indigo-400" />
          <span>Share Story</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-indigo-500/12 text-indigo-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full shadow-sm shadow-indigo-500/50" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Quick Profile & Logout */}
      {user && (
        <div className="pt-4 border-t border-white/[0.07]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="flex items-center space-x-2.5 truncate">
              <Avatar src={user.avatar} alt={user.name} size="sm" />
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">{user.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user.countryCode} {user.phoneNumber}</p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Log out"
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
