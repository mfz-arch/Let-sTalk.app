'use client';

import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onlineStatus?: 'online' | 'offline' | 'away';
  showStatus?: boolean;
  className?: string;
  hasStoryRing?: boolean;
  hasUnseenStory?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-2xl',
};

const statusSizeClasses = {
  xs: 'w-2 h-2 ring-1',
  sm: 'w-2.5 h-2.5 ring-2',
  md: 'w-3.5 h-3.5 ring-2',
  lg: 'w-4 h-4 ring-2',
  xl: 'w-5 h-5 ring-3',
  '2xl': 'w-6 h-6 ring-4',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  onlineStatus,
  showStatus = false,
  className = '',
  hasStoryRing = false,
  hasUnseenStory = true,
  onClick,
}) => {
  const storyRingClass = hasStoryRing
    ? hasUnseenStory
      ? 'p-[2.5px] rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-purple-500/20'
      : 'p-[2px] rounded-full border-2 border-zinc-700/60 opacity-60'
    : '';

  return (
    <div
      onClick={onClick}
      className={`relative inline-block flex-shrink-0 cursor-pointer ${storyRingClass} ${className}`}
    >
      <div className={`relative overflow-hidden rounded-full bg-zinc-800 border border-zinc-700/50 ${sizeClasses[size]}`}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="120px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-zinc-300 uppercase">
            {alt ? alt.substring(0, 2) : 'U'}
          </div>
        )}
      </div>

      {showStatus && onlineStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-zinc-950 ${statusSizeClasses[size]} ${
            onlineStatus === 'online'
              ? 'bg-emerald-500'
              : onlineStatus === 'away'
              ? 'bg-amber-500'
              : 'bg-zinc-500'
          }`}
        />
      )}
    </div>
  );
};
