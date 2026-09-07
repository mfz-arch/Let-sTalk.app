'use client';

import React from 'react';
import { MessageSquare, ShieldCheck, Zap } from 'lucide-react';

export const ChatEmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950/60">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600/20 to-violet-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 mb-6 shadow-2xl">
        <MessageSquare className="w-10 h-10" />
      </div>

      <h3 className="text-xl font-bold text-zinc-100">Select a conversation</h3>
      <p className="text-sm text-zinc-400 max-w-sm mt-2 leading-relaxed">
        Choose a user from your chats list on the left or search for new friends to start instant messaging.
      </p>

      <div className="flex items-center justify-center space-x-6 mt-8 pt-6 border-t border-zinc-800/60 text-xs text-zinc-500">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Private Messaging</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Real-time Ready</span>
        </div>
      </div>
    </div>
  );
};
