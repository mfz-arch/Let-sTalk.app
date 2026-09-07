'use client';

import React from 'react';
import Image from 'next/image';
import { Check, CheckCheck } from 'lucide-react';
import { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe }) => {
  const timeFormatted = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}>
      <div
        className={`max-w-[78%] md:max-w-[65%] rounded-2xl p-3.5 shadow-md relative group transition-all ${
          isMe
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-indigo-600/15'
            : 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/50 rounded-bl-none'
        }`}
      >
        {/* Story Reply context header */}
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

        {/* Media attachment */}
        {message.mediaUrl && (
          <div className="relative w-full h-56 rounded-xl overflow-hidden mb-2 border border-black/20">
            <Image
              src={message.mediaUrl}
              alt="Attachment"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-normal">
            {message.content}
          </p>
        )}

        {/* Message Timestamp & Delivery Checks */}
        <div className={`flex items-center justify-end space-x-1.5 mt-1 text-[10px] ${isMe ? 'text-indigo-200' : 'text-zinc-400'}`}>
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
  );
};
