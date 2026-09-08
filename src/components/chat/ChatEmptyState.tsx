'use client';

import React from 'react';
import { MessageSquare, ShieldCheck, Zap } from 'lucide-react';

export const ChatEmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0b0c10]">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-5 shadow-lg shadow-indigo-500/5">
        <MessageSquare className="w-8 h-8" />
      </div>

      <h3 className="text-base font-bold text-zinc-100">Select a conversation</h3>
      <p className="text-xs text-zinc-400 max-w-xs mt-1.5 leading-relaxed">
        Choose a chat from the sidebar or search for friends to start private real-time messaging.
      </p>

      <div className="flex items-center justify-center space-x-6 mt-8 pt-5 border-t border-white/[0.07] text-[11px] text-zinc-500 font-medium">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Sync</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Instant WebSockets</span>
        </div>
      </div>
    </div>
  );
};
