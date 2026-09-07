'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Check, CheckCheck, Play, Pause, X, Download, Volume2, PhoneCall, PhoneMissed, CornerUpLeft } from 'lucide-react';
import { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onReply?: (message: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe, onReply }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const timeFormatted = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine actual media type dynamically
  const isAudio =
    message.type === 'audio' ||
    (message.mediaUrl && (message.mediaUrl.startsWith('data:audio') || message.mediaUrl.includes('audio') || message.content?.includes('Voice message')));

  const isImage =
    (message.type === 'image' || message.mediaUrl?.startsWith('data:image') || (message.mediaUrl && !isAudio)) &&
    message.type !== 'audio';

  const isCallLog =
    message.content?.includes('Voice Call') ||
    message.content?.includes('Video Call') ||
    message.content?.includes('Missed') ||
    message.content?.includes('Call');

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlayingAudio(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      if (!audioDuration && audioRef.current.duration) {
        setAudioDuration(audioRef.current.duration);
      }
    }
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setAudioCurrentTime(seekTime);
    }
  };

  const formatAudioTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.floor(sec % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3 group/msg relative`}>
        {/* CALL LOG BUBBLE */}
        {isCallLog ? (
          <div className="flex justify-center my-1">
            <div className="bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs px-4 py-2 rounded-2xl flex items-center space-x-2 shadow-sm">
              {message.content.includes('Missed') ? (
                <PhoneMissed className="w-4 h-4 text-rose-400" />
              ) : (
                <PhoneCall className="w-4 h-4 text-emerald-400" />
              )}
              <span className="font-medium">{message.content}</span>
              <span className="text-[10px] text-zinc-500 ml-2">{timeFormatted}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 max-w-[85%] md:max-w-[70%]">
            {/* Quick Reply Button on Hover (WhatsApp style) */}
            {onReply && isMe && (
              <button
                type="button"
                onClick={() => onReply(message)}
                className="opacity-0 group-hover/msg:opacity-100 p-1.5 text-zinc-400 hover:text-white bg-zinc-800/80 rounded-full transition-opacity shadow-sm"
                title="Reply"
              >
                <CornerUpLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <div
              className={`rounded-2xl p-3.5 shadow-md relative transition-all w-full ${
                isMe
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-indigo-600/15'
                  : 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/50 rounded-bl-none'
              }`}
            >
              {/* WhatsApp Style Quoted Reply Card inside Message Bubble */}
              {message.replyTo && (
                <div className="mb-2.5 p-2.5 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-1 h-9 bg-emerald-400 rounded-full flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-emerald-400 truncate">
                      {message.replyTo.senderName}
                    </p>
                    <p className="text-xs text-zinc-200 truncate">
                      {message.replyTo.type === 'audio'
                        ? '🎙️ Voice message'
                        : message.replyTo.type === 'image'
                        ? '📷 Photo'
                        : message.replyTo.content}
                    </p>
                  </div>
                </div>
              )}

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
              {isImage && message.mediaUrl && (
                <div className="mb-2 overflow-hidden rounded-xl bg-black/20">
                  <img
                    src={message.mediaUrl}
                    alt="Shared photo"
                    onClick={() => setShowImageLightbox(true)}
                    className="max-h-80 w-auto max-w-full object-contain rounded-xl cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all shadow-md"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* WhatsApp Style Audio Voice Note Player */}
              {isAudio && message.mediaUrl && (
                <div className="flex items-center space-x-3 py-1.5 px-2.5 min-w-[240px] max-w-[300px] bg-black/25 rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={toggleAudio}
                    className={`p-3 rounded-full text-white transition-transform active:scale-95 flex-shrink-0 shadow-md ${
                      isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                    }`}
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                  </button>

                  <div className="flex-1 flex flex-col justify-center space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200">
                      <span className="flex items-center space-x-1">
                        <Volume2 className="w-3.5 h-3.5 opacity-80" />
                        <span>Voice Note</span>
                      </span>
                      <span>{formatAudioTime(isPlayingAudio ? audioCurrentTime : audioDuration)}</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={audioDuration || 100}
                      value={audioCurrentTime}
                      onChange={handleAudioSeek}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>

                  <audio
                    ref={audioRef}
                    src={message.mediaUrl}
                    onTimeUpdate={handleAudioTimeUpdate}
                    onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
                    onEnded={() => {
                      setIsPlayingAudio(false);
                      setAudioCurrentTime(0);
                    }}
                    className="hidden"
                  />
                </div>
              )}

              {/* Text Content */}
              {message.content && !isAudio && !message.content.includes('Voice message') && (
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

            {/* Quick Reply Button on Hover (WhatsApp style for other person's messages) */}
            {onReply && !isMe && (
              <button
                type="button"
                onClick={() => onReply(message)}
                className="opacity-0 group-hover/msg:opacity-100 p-1.5 text-zinc-400 hover:text-white bg-zinc-800/80 rounded-full transition-opacity shadow-sm"
                title="Reply"
              >
                <CornerUpLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
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
