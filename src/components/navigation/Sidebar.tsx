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
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 glass-panel border-r border-zinc-800/80 px-4 py-6 justify-between flex-shrink-0 z-30">
      <div className="space-y-8">
        {/* Brand Header */}
        <Link href="/" className="flex items-center space-x-3 px-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Let'sTalk
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">Social Chat</p>
          </div>
        </Link>

        {/* Quick Action: Add Story */}
        <button
          onClick={openStoryCreator}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600/20 to-violet-600/20 hover:from-indigo-600/30 hover:to-violet-600/30 border border-indigo-500/30 text-indigo-300 font-semibold text-sm transition-all group shadow-md"
        >
          <PlusCircle className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Share Story</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Quick Profile & Logout */}
      {user && (
        <div className="pt-4 border-t border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3 truncate">
              <Avatar src={user.avatar} alt={user.name} size="sm" />
              <div className="truncate">
                <p className="text-sm font-semibold text-zinc-100 truncate">{user.name}</p>
                <p className="text-xs text-zinc-400 truncate">{user.countryCode} {user.phoneNumber}</p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Log out"
              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
