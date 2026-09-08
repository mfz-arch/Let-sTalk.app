'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Send, Eye, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStories } from '../../context/StoryContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { storyService } from '../../services/storyService';
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
    toggleLikeStory,
  } = useStories();

  const { startConversationWithUser, sendMessage, setActiveConversation } = useChat();
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewersList, setShowViewersList] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const currentSlide = activeStoryGroup?.slides[activeSlideIndex];
  const isMyStory = activeStoryGroup?.userId === user?.id;
  const isLiked = currentSlide?.likes?.includes(user?.id || '');

  // Record view on MongoDB Atlas when user views someone else's story
  useEffect(() => {
    if (user && currentSlide && !isMyStory) {
      storyService.recordStoryView(currentSlide.id, user.id);
    }
  }, [user, currentSlide, isMyStory]);

  // Auto advance slide every 5 seconds unless paused or viewers modal is open
  useEffect(() => {
    if (!isViewerOpen || isPaused || showViewersList || !currentSlide || showToast) return;
    const timer = setTimeout(() => {
      nextSlide();
    }, 5000);
    return () => clearTimeout(timer);
  }, [isViewerOpen, isPaused, showViewersList, activeSlideIndex, activeStoryGroup, currentSlide, nextSlide, showToast]);

  if (!isViewerOpen || !activeStoryGroup || !currentSlide) return null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      const conv = await startConversationWithUser(activeStoryGroup.userId);

      await sendMessage(
        replyText,
        'story_reply',
        undefined,
        {
          storyId: currentSlide.id,
          storyMediaUrl: currentSlide.mediaUrl,
        },
        undefined,
        conv
      );

      setReplyText('');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        closeStoryViewer();
      }, 1800);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
        {/* Toast Banner Notification when reply sent */}
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 z-50 bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 border border-emerald-400/30"
          >
            <span>✓ Message sent successfully!</span>
          </motion.div>
        )}

        {/* Backdrop dismiss */}
        <div className="absolute inset-0" onClick={closeStoryViewer} />

        {/* Story Viewer Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-sm h-[85vh] max-h-[720px] bg-[#0B0C10] rounded-2xl overflow-hidden shadow-2xl border border-white/[0.07] flex flex-col justify-between"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Background High-Res Story Image */}
          <div className="absolute inset-0 z-0 bg-[#0B0C10] flex items-center justify-center">
            <img
              src={currentSlide.mediaUrl}
              alt={currentSlide.caption || 'Story slide'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
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
                        : idx === activeSlideIndex && !isPaused && !showViewersList
                        ? 'w-full animate-pulse'
                        : idx === activeSlideIndex
                        ? 'w-full'
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
                {isMyStory && (
                  <button
                    onClick={() => setShowViewersList(!showViewersList)}
                    className="flex items-center space-x-1 text-xs text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 hover:bg-black/70 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{currentSlide.viewsCount || 1}</span>
                  </button>
                )}

                <button
                  onClick={closeStoryViewer}
                  className="p-1.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Target Overlays */}
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

          {/* Story Caption & Action Form */}
          <div className="relative z-10 p-4 space-y-3 mt-auto">
            {currentSlide.caption && (
              <p className="text-sm font-medium text-white text-center drop-shadow-md px-3 bg-black/50 backdrop-blur-md py-2.5 rounded-xl border border-white/10">
                {currentSlide.caption}
              </p>
            )}

            {/* Like Heart & Quick Reply Form */}
            <div className="flex items-center space-x-2">
              {!isMyStory && (
                <form onSubmit={handleSendReply} className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`Reply to ${activeStoryGroup.user.name.split(' ')[0]}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/60 outline-none focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-colors shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Heart Like Button */}
              <button
                type="button"
                onClick={() => toggleLikeStory(currentSlide.id)}
                className={`p-2.5 rounded-xl backdrop-blur-md border transition-transform active:scale-90 ${
                  isLiked
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                    : 'bg-black/50 text-white/80 border-white/20 hover:text-white'
                }`}
                title={isLiked ? 'Unlike Story' : 'Like Story'}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* STORY VIEWERS & LIKES MODAL */}
          {showViewersList && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute inset-x-0 bottom-0 z-30 bg-[#12141A]/95 backdrop-blur-xl rounded-t-2xl p-5 border-t border-white/[0.07] space-y-4 max-h-[60%]"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white">Story Views & Likes</h3>
                </div>
                <button
                  onClick={() => setShowViewersList(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-48">
                {currentSlide.viewers && currentSlide.viewers.length > 0 ? (
                  currentSlide.viewers.map((viewer: any, vIdx: number) => {
                    const viewerLiked = currentSlide.likes?.includes(viewer.userId);
                    return (
                      <div key={vIdx} className="flex items-center justify-between p-2 rounded-xl bg-[#1A1D24] border border-white/[0.07]">
                        <div className="flex items-center space-x-3">
                          <Avatar src={viewer.avatar || ''} alt={viewer.name || 'Viewer'} size="sm" />
                          <div>
                            <p className="text-xs font-semibold text-white">
                              {viewer.name} {viewer.userId === user?.id ? '(You)' : ''}
                            </p>
                            <p className="text-[10px] text-zinc-400">Viewed story</p>
                          </div>
                        </div>
                        {viewerLiked && <Heart className="w-4 h-4 text-rose-500 fill-current" />}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#1A1D24] border border-white/[0.07]">
                    <div className="flex items-center space-x-3">
                      <Avatar src={user?.avatar || ''} alt={user?.name || ''} size="sm" />
                      <div>
                        <p className="text-xs font-semibold text-white">{user?.name} (You)</p>
                        <p className="text-[10px] text-zinc-400">Viewed just now</p>
                      </div>
                    </div>
                    {isLiked && <Heart className="w-4 h-4 text-rose-500 fill-current" />}
                  </div>
                )}

                {currentSlide.likes && currentSlide.likes.length > 0 && (
                  <div className="text-[11px] text-rose-400 font-semibold pt-1">
                    ❤️ {currentSlide.likes.length} people liked this story
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
