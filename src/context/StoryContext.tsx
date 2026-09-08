'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserStoryGroup } from '../types/story';
import { storyService } from '../services/storyService';
import { useAuth } from './AuthContext';

interface StoryContextType {
  stories: UserStoryGroup[];
  activeStoryGroup: UserStoryGroup | null;
  activeSlideIndex: number;
  isViewerOpen: boolean;
  isCreateOpen: boolean;
  isLoading: boolean;
  openStoryViewer: (storyGroup: UserStoryGroup, slideIndex?: number) => void;
  closeStoryViewer: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  openStoryCreator: () => void;
  closeStoryCreator: () => void;
  addStory: (mediaUrl: string, caption?: string) => Promise<void>;
  toggleLikeStory: (storyId: string) => Promise<void>;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState<UserStoryGroup[]>([]);
  const [activeStoryGroup, setActiveStoryGroup] = useState<UserStoryGroup | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStories = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await storyService.getStories();
      setStories(data);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories(true);

    // Silent background poll for stories every 3.5 seconds
    const storyInterval = setInterval(() => {
      fetchStories(false);
    }, 3500);

    return () => clearInterval(storyInterval);
  }, [fetchStories]);

  const openStoryViewer = (group: UserStoryGroup, slideIndex = 0) => {
    setActiveStoryGroup(group);
    setActiveSlideIndex(slideIndex);
    setIsViewerOpen(true);
    storyService.markStorySeen(group.userId);

    // Immediately update local stories state to set hasUnseen = false
    setStories((prevStories) =>
      prevStories.map((s) => (s.userId === group.userId ? { ...s, hasUnseen: false } : s))
    );
  };

  const closeStoryViewer = () => {
    setIsViewerOpen(false);
    setActiveStoryGroup(null);
    setActiveSlideIndex(0);
  };

  const nextSlide = () => {
    if (!activeStoryGroup) return;
    if (activeSlideIndex < activeStoryGroup.slides.length - 1) {
      setActiveSlideIndex((prev) => prev + 1);
    } else {
      const currentGroupIndex = stories.findIndex((s) => s.userId === activeStoryGroup.userId);
      if (currentGroupIndex !== -1 && currentGroupIndex < stories.length - 1) {
        const nextGroup = stories[currentGroupIndex + 1];
        openStoryViewer(nextGroup, 0);
      } else {
        closeStoryViewer();
      }
    }
  };

  const prevSlide = () => {
    if (!activeStoryGroup) return;
    if (activeSlideIndex > 0) {
      setActiveSlideIndex((prev) => prev - 1);
    } else {
      const currentGroupIndex = stories.findIndex((s) => s.userId === activeStoryGroup.userId);
      if (currentGroupIndex > 0) {
        const prevGroup = stories[currentGroupIndex - 1];
        openStoryViewer(prevGroup, prevGroup.slides.length - 1);
      } else {
        closeStoryViewer();
      }
    }
  };

  const openStoryCreator = () => setIsCreateOpen(true);
  const closeStoryCreator = () => setIsCreateOpen(false);

  const addStory = async (mediaUrl: string, caption?: string) => {
    if (!user) return;
    await storyService.addStory(user, mediaUrl, caption);
    await fetchStories(false);
    closeStoryCreator();
  };

  const toggleLikeStory = async (storyId: string) => {
    if (!user || !activeStoryGroup) return;

    // Optimistically update local active story slide state
    setActiveStoryGroup((prevGroup) => {
      if (!prevGroup) return null;
      const updatedSlides = prevGroup.slides.map((slide) => {
        if (slide.id === storyId) {
          const currentLikes = slide.likes || [];
          const hasLiked = currentLikes.includes(user.id);
          const newLikes = hasLiked
            ? currentLikes.filter((id) => id !== user.id)
            : [...currentLikes, user.id];
          return {
            ...slide,
            likes: newLikes,
            likesCount: newLikes.length,
          };
        }
        return slide;
      });
      return { ...prevGroup, slides: updatedSlides };
    });

    await storyService.toggleLikeStory(storyId, user.id);
    fetchStories(false);
  };

  return (
    <StoryContext.Provider
      value={{
        stories,
        activeStoryGroup,
        activeSlideIndex,
        isViewerOpen,
        isCreateOpen,
        isLoading,
        openStoryViewer,
        closeStoryViewer,
        nextSlide,
        prevSlide,
        openStoryCreator,
        closeStoryCreator,
        addStory,
        toggleLikeStory,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStories = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStories must be used within a StoryProvider');
  }
  return context;
};
