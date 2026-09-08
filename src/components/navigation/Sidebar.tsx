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
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200 px-4 py-5 justify-between flex-shrink-0 z-30">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center space-x-3 px-2 py-1 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-600 transition-colors">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-slate-900">
              Let'sTalk
            </h1>
            <p className="text-[9px] uppercase tracking-widest text-emerald-600 font-bold -mt-0.5">Social Messenger</p>
          </div>
        </Link>

        {/* Quick Action: Share Story */}
        <button
          onClick={openStoryCreator}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs tracking-wide transition-all active:scale-[0.98] shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          <span>Share Story</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold border-l-4 border-emerald-500'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Quick Profile & Logout */}
      {user && (
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-2.5 truncate">
              <Avatar src={user.avatar} alt={user.name} size="sm" />
              <div className="truncate min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.countryCode} {user.phoneNumber}</p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
