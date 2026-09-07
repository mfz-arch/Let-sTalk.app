'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Check, CheckCheck, Play, Pause, X, Download, Volume2 } from 'lucide-react';
import { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const timeFormatted = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  return (
    <>
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}>
        <div
          className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3.5 shadow-md relative group transition-all ${
            isMe
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-indigo-600/15'
              : 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/50 rounded-bl-none'
          }`}
        >
          {/* Story Reply Context Header */}
          {message.type === 'story_reply' && message.storyContext && (
            <div className="mb-2.5 p-2 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 flex items-center space-x-2.5">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={message.storyContext.storyMediaUrl}
                  alt="Story thumbnail"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-xs text-zinc-300 font-medium italic truncate">
                Replied to story
              </span>
            </div>
          )}

          {/* Image Attachment (WhatsApp Style Proportional Display + Click to Lightbox) */}
          {(message.type === 'image' || (message.mediaUrl && message.type !== 'audio')) && (
            <div className="mb-2 overflow-hidden rounded-xl">
              <img
                src={message.mediaUrl}
                alt="Shared photo"
                onClick={() => setShowImageLightbox(true)}
                className="max-h-80 w-auto max-w-full object-contain rounded-xl cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all shadow-md"
              />
            </div>
          )}

          {/* Audio Voice Note Player */}
          {message.type === 'audio' && message.mediaUrl && (
            <div className="flex items-center space-x-3 py-1 px-2 min-w-[200px] bg-black/20 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={toggleAudio}
                className={`p-2.5 rounded-full text-white transition-transform active:scale-95 ${
                  isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
                }`}
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <div className="flex-1 flex flex-col justify-center space-y-1">
                <div className="flex items-center space-x-1">
                  <Volume2 className="w-3.5 h-3.5 opacity-80" />
                  <span className="text-xs font-semibold tracking-wide">Voice Message</span>
                </div>
                {/* Audio Waveform visualization */}
                <div className="flex items-center space-x-0.5 h-3 opacity-70">
                  <div className="w-1 h-2 bg-current rounded-full animate-pulse" />
                  <div className="w-1 h-3 bg-current rounded-full" />
                  <div className="w-1 h-1 bg-current rounded-full" />
                  <div className="w-1 h-3 bg-current rounded-full" />
                  <div className="w-1 h-2 bg-current rounded-full" />
                  <div className="w-1 h-3 bg-current rounded-full" />
                  <div className="w-1 h-1 bg-current rounded-full" />
                  <div className="w-1 h-2.5 bg-current rounded-full" />
                </div>
              </div>

              <audio
                ref={audioRef}
                src={message.mediaUrl}
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
            </div>
          )}

          {/* Text Content (if not just standard voice icon note text) */}
          {message.content && message.type !== 'audio' && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-normal">
              {message.content}
            </p>
          )}

          {/* Message Timestamp & Delivery Status */}
          <div
            className={`flex items-center justify-end space-x-1.5 mt-1.5 text-[10px] ${
              isMe ? 'text-indigo-200' : 'text-zinc-400'
            }`}
          >
            <span>{timeFormatted}</span>
            {isMe && (
              <span>
                {message.status === 'read' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-cyan-300 inline" />
                ) : message.status === 'delivered' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-indigo-200 inline" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-indigo-200 inline" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {showImageLightbox && message.mediaUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4">
          <div className="absolute top-4 right-4 flex items-center space-x-3 z-10">
            <a
              href={message.mediaUrl}
              download="photo.jpg"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-zinc-800/80 text-white hover:bg-zinc-700 rounded-full transition-colors"
              title="Download Photo"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={() => setShowImageLightbox(false)}
              className="p-2.5 bg-rose-600 text-white hover:bg-rose-500 rounded-full shadow-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative max-w-5xl max-h-[90vh] flex items-center justify-center p-2">
            <img
              src={message.mediaUrl}
              alt="Expanded view"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-zinc-800"
            />
          </div>
        </div>
      )}
    </>
  );
};
