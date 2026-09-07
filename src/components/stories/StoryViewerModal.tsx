'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Send, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStories } from '../../context/StoryContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export const StoryViewerModal: React.FC = () => {
  const { user } = useAuth();
  const {
    activeStoryGroup,
    activeSlideIndex,
    isViewerOpen,
    closeStoryViewer,
    nextSlide,
    prevSlide,
  } = useStories();

  const { startConversationWithUser, sendMessage, setActiveConversation } = useChat();
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentSlide = activeStoryGroup?.slides[activeSlideIndex];

  // Auto advance slide every 5 seconds unless paused
  useEffect(() => {
    if (!isViewerOpen || isPaused || !currentSlide) return;
    const timer = setTimeout(() => {
      nextSlide();
    }, 5000);
    return () => clearTimeout(timer);
  }, [isViewerOpen, isPaused, activeSlideIndex, activeStoryGroup, currentSlide, nextSlide]);

  if (!isViewerOpen || !activeStoryGroup || !currentSlide) return null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      // Create conversation with story owner if not exists
      const conv = await startConversationWithUser(activeStoryGroup.userId);
      setActiveConversation(conv);

      // Send story reply message
      await sendMessage(
        replyText,
        'story_reply',
        undefined,
        {
          storyId: currentSlide.id,
          storyMediaUrl: currentSlide.mediaUrl,
        }
      );

      setReplyText('');
      closeStoryViewer();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
        {/* Backdrop dismiss */}
        <div
          className="absolute inset-0"
          onClick={closeStoryViewer}
        />

        {/* Story Viewer Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-sm h-[85vh] max-h-[700px] bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col justify-between"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Background Story Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={currentSlide.mediaUrl}
              alt={currentSlide.caption || 'Story slide'}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
          </div>

          {/* Story Header */}
          <div className="relative z-10 p-4 space-y-3">
            {/* Progress Bars */}
            <div className="flex space-x-1.5 w-full">
              {activeStoryGroup.slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all duration-200 ${
                      idx < activeSlideIndex
                        ? 'w-full'
                        : idx === activeSlideIndex
                        ? 'w-full animate-pulse'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Author Info & Close button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={activeStoryGroup.user.avatar}
                  alt={activeStoryGroup.user.name}
                  size="sm"
                />
                <div>
                  <h4 className="text-sm font-semibold text-white drop-shadow">
                    {activeStoryGroup.user.name}
                  </h4>
                  <span className="text-[10px] text-zinc-300 drop-shadow">
                    {new Date(currentSlide.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {activeStoryGroup.userId === user?.id && (
                  <div className="flex items-center space-x-1 text-xs text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{currentSlide.viewsCount}</span>
                  </div>
                )}

                <button
                  onClick={closeStoryViewer}
                  className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Click Target overlays */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 text-white/70 hover:text-white bg-black/30 rounded-full backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 text-white/70 hover:text-white bg-black/30 rounded-full backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Story Caption & Quick Reply Input */}
          <div className="relative z-10 p-4 space-y-3 mt-auto">
            {currentSlide.caption && (
              <p className="text-sm font-medium text-white text-center drop-shadow-md px-2 bg-black/30 backdrop-blur-md py-2 rounded-xl border border-white/10">
                {currentSlide.caption}
              </p>
            )}

            {/* Quick Reply Form (only for other users' stories) */}
            {activeStoryGroup.userId !== user?.id && (
              <form onSubmit={handleSendReply} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={`Reply to ${activeStoryGroup.user.name.split(' ')[0]}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 outline-none focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-full transition-colors shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
