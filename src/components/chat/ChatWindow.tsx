'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Phone, Video, Info } from 'lucide-react';
import { Conversation, Message } from '../../types/chat';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChatMessageSkeleton } from '../common/Skeleton';
import { CallOverlayModal } from './CallOverlayModal';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  isLoading?: boolean;
  onSendMessage: (text: string, mediaUrl?: string) => Promise<void>;
  onBackMobile?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  isLoading = false,
  onSendMessage,
  onBackMobile,
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeCall, setActiveCall] = useState<'audio' | 'video' | null>(null);

  const otherParticipant =
    conversation.participants.find((p) => p.id !== user?.id) || conversation.participants[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950/40 overflow-hidden relative">
      {/* Active Chat Header */}
      <div className="glass-panel px-4 py-3 border-b border-zinc-800 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <Link href="/profile" className="flex items-center space-x-3 group">
            <Avatar
              src={otherParticipant?.avatar || ''}
              alt={otherParticipant?.name || 'User'}
              size="md"
              showStatus
              onlineStatus={otherParticipant?.onlineStatus}
            />

            <div>
              <h3 className="text-sm font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                {otherParticipant?.name}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {otherParticipant?.onlineStatus === 'online' ? (
                  <span className="text-emerald-400 font-medium">Online</span>
                ) : (
                  <span>Last seen {otherParticipant?.lastSeen || 'recently'}</span>
                )}
              </p>
            </div>
          </Link>
        </div>

        {/* Call Action Icons */}
        <div className="flex items-center space-x-1 text-zinc-400">
          <button
            onClick={() => setActiveCall('audio')}
            className="p-2 hover:text-indigo-400 hover:bg-zinc-800/60 rounded-xl transition-colors"
            title="Audio Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveCall('video')}
            className="p-2 hover:text-indigo-400 hover:bg-zinc-800/60 rounded-xl transition-colors"
            title="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 hover:text-indigo-400 hover:bg-zinc-800/60 rounded-xl transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Security privacy notice */}
        <div className="flex justify-center my-4">
          <div className="bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-xs px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
            🔒 Messages are encrypted & private between {user?.name.split(' ')[0]} and {otherParticipant?.name.split(' ')[0]}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <ChatMessageSkeleton isMe={false} />
            <ChatMessageSkeleton isMe={true} />
            <ChatMessageSkeleton isMe={false} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500">
            <p className="text-sm">No message history yet.</p>
            <p className="text-xs mt-1">Say hello to 👋 {otherParticipant?.name}!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMe={msg.senderId === user?.id}
            />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <MessageInput onSend={onSendMessage} />

      {/* Interactive Call Overlay Modal */}
      {otherParticipant && (
        <CallOverlayModal
          isOpen={!!activeCall}
          onClose={() => setActiveCall(null)}
          targetUser={otherParticipant}
          callType={activeCall || 'audio'}
        />
      )}
    </div>
  );
};
