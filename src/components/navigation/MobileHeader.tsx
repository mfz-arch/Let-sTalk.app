'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStories } from '../../context/StoryContext';
import { Avatar } from '../common/Avatar';

export const MobileHeader: React.FC = () => {
  const { user } = useAuth();
  const { openStoryCreator } = useStories();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
      <Link href="/" className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-xs">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
        <span className="font-extrabold text-base text-slate-900 tracking-tight">
          Let'sTalk
        </span>
      </Link>

      <div className="flex items-center space-x-3">
        <button
          onClick={openStoryCreator}
          className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200"
          title="Share Story"
        >
          <PlusCircle className="w-5 h-5" />
        </button>

        {user && (
          <Link href="/profile">
            <Avatar src={user.avatar} alt={user.name} size="sm" />
          </Link>
        )}
      </div>
    </header>
  );
};
