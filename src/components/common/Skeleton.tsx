'use client';

import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-zinc-800/60 ${className}`}
    />
  );
};

export const ConversationSkeleton = () => (
  <div className="flex items-center space-x-3.5 p-3 rounded-2xl glass-card">
    <Skeleton className="w-12 h-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="w-1/3 h-4" />
      <Skeleton className="w-2/3 h-3" />
    </div>
  </div>
);

export const StorySkeleton = () => (
  <div className="flex flex-col items-center space-y-2">
    <Skeleton className="w-16 h-16 rounded-full" />
    <Skeleton className="w-12 h-3" />
  </div>
);

export const ChatMessageSkeleton = ({ isMe = false }: { isMe?: boolean }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
    <Skeleton className={`h-12 rounded-2xl ${isMe ? 'w-48 bg-indigo-900/30' : 'w-56 bg-zinc-800/80'}`} />
  </div>
);
