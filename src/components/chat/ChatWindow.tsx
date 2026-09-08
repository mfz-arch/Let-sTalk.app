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
import { useCall } from '../../context/CallContext';
import { useSocket } from '../../context/SocketContext';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  isLoading?: boolean;
  onSendMessage: (text: string, mediaUrl?: string, type?: 'text' | 'image' | 'audio', replyTo?: Message['replyTo']) => Promise<void>;
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
  const { initiateCall } = useCall();
  const { onlineUsers } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);

  const otherParticipant =
    conversation.participants.find((p) => p.id !== user?.id) || conversation.participants[0];

  const isOnline = onlineUsers.has(otherParticipant?.id) || otherParticipant?.onlineStatus === 'online';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden relative">
      {/* Active Chat Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center space-x-3 min-w-0">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <Link href="/profile" className="flex items-center space-x-3 group min-w-0">
            <Avatar
              src={otherParticipant?.avatar || ''}
              alt={otherParticipant?.name || 'User'}
              size="md"
              showStatus
              onlineStatus={isOnline ? 'online' : 'offline'}
            />

            <div className="truncate min-w-0">
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                {otherParticipant?.name}
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                {isOnline ? (
                  <span className="text-emerald-600 font-bold">Online</span>
                ) : (
                  <span>Last seen {otherParticipant?.lastSeen || 'recently'}</span>
                )}
              </p>
            </div>
          </Link>
        </div>

        {/* Call Action Icons */}
        <div className="flex items-center space-x-1 text-slate-500">
          <button
            onClick={() => otherParticipant && initiateCall(otherParticipant, 'audio')}
            className="p-2 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Audio Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => otherParticipant && initiateCall(otherParticipant, 'video')}
            className="p-2 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
        {/* Security privacy notice */}
        <div className="flex justify-center my-3">
          <div className="bg-white border border-slate-200 text-slate-500 text-[11px] font-medium px-3 py-1 rounded-full shadow-xs">
            🔒 Private conversation between {user?.name.split(' ')[0]} and {otherParticipant?.name.split(' ')[0]}
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
            <p className="text-xs font-semibold text-zinc-400">No message history yet.</p>
            <p className="text-[11px] text-zinc-500 mt-1">Say hello to 👋 {otherParticipant?.name}!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMe={msg.senderId === user?.id}
              onReply={(m) => setReplyingToMessage(m)}
            />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <MessageInput
        onSend={onSendMessage}
        replyingToMessage={replyingToMessage}
        onCancelReply={() => setReplyingToMessage(null)}
        otherParticipantName={otherParticipant?.name}
      />
    </div>
  );
};
