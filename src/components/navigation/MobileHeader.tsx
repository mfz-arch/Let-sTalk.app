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
    <header className="md:hidden sticky top-0 z-30 glass-panel border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <span className="font-extrabold text-lg bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Let'sTalk
        </span>
      </Link>

      <div className="flex items-center space-x-3">
        <button
          onClick={openStoryCreator}
          className="p-1.5 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
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
