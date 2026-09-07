'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStories } from '../../context/StoryContext';
import { Avatar } from '../common/Avatar';
import { StorySkeleton } from '../common/Skeleton';

export const StoryBar: React.FC = () => {
  const { user } = useAuth();
  const { stories, openStoryViewer, openStoryCreator, isLoading } = useStories();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4 overflow-x-auto py-2 no-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <StorySkeleton key={i} />
        ))}
      </div>
    );
  }

  // Check if current user has an active story
  const currentUserStory = user ? stories.find((s) => s.userId === user.id) : null;
  const otherStories = stories.filter((s) => user && s.userId !== user.id);

  return (
    <div className="w-full glass-panel rounded-2xl p-4 border border-zinc-800/80">
      <div className="flex items-center space-x-4 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {/* Your Story item */}
        <div className="flex flex-col items-center space-y-1.5 flex-shrink-0 cursor-pointer group">
          <div className="relative">
            {currentUserStory ? (
              <Avatar
                src={currentUserStory.slides[0].mediaUrl}
                alt="Your Story"
                size="lg"
                hasStoryRing
                hasUnseenStory={false}
                onClick={() => openStoryViewer(currentUserStory, 0)}
              />
            ) : user ? (
              <Avatar
                src={user.avatar}
                alt="Your Story"
                size="lg"
                onClick={openStoryCreator}
              />
            ) : null}

            <button
              onClick={openStoryCreator}
              className="absolute bottom-0 right-0 p-1 bg-indigo-600 rounded-full text-white border-2 border-zinc-950 hover:bg-indigo-500 transition-colors shadow-md"
              title="Add Story"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
            Your Story
          </span>
        </div>

        {/* Other Users' Stories */}
        {otherStories.map((storyGroup) => (
          <div
            key={storyGroup.userId}
            onClick={() => openStoryViewer(storyGroup, 0)}
            className="flex flex-col items-center space-y-1.5 flex-shrink-0 cursor-pointer group"
          >
            <Avatar
              src={storyGroup.user.avatar}
              alt={storyGroup.user.name}
              size="lg"
              hasStoryRing
              hasUnseenStory={storyGroup.hasUnseen}
            />
            <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors max-w-[70px] truncate text-center">
              {storyGroup.user.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
