'use client';

import React from 'react';
import { MessageSquare, ShieldCheck, Zap } from 'lucide-react';

export const ChatEmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC]">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200/80 mb-5 shadow-xs">
        <MessageSquare className="w-8 h-8" />
      </div>

      <h3 className="text-base font-bold text-slate-900">Select a conversation</h3>
      <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
        Choose a chat from the sidebar or search for friends to start private real-time messaging.
      </p>

      <div className="flex items-center justify-center space-x-6 mt-8 pt-5 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Sync</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Instant WebSockets</span>
        </div>
      </div>
    </div>
  );
};
