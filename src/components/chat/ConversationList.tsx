'use client';

import React from 'react';
import { Conversation } from '../../types/chat';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Avatar } from '../common/Avatar';
import { ConversationSkeleton } from '../common/Skeleton';
import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conv: Conversation) => void;
  isLoading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3, 4].map((i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 my-auto">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
          <MessageSquarePlus className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-200">No conversations yet</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
            Find someone on Let'sTalk and start your first private conversation.
          </p>
        </div>
        <Link
          href="/search"
          className="px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600/30 transition-colors"
        >
          Discover People
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2 overflow-y-auto max-h-[calc(100vh-140px)]">
      {conversations.map((conv) => {
        const otherParticipant = conv.participants.find((p) => p.id !== user?.id) || conv.participants[0];
        const isActive = activeId === conv.id;
        const lastMsg = conv.lastMessage;
        
        // Determine real-time online status
        const isOnline = onlineUsers.has(otherParticipant?.id) || otherParticipant?.onlineStatus === 'online';

        return (
          <div
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`flex items-center space-x-3.5 p-3 rounded-2xl cursor-pointer transition-all ${
              isActive
                ? 'bg-indigo-600/20 border border-indigo-500/30 shadow-md'
                : 'hover:bg-zinc-800/60 border border-transparent'
            }`}
          >
            <Avatar
              src={otherParticipant?.avatar || ''}
              alt={otherParticipant?.name || 'User'}
              size="md"
              showStatus
              onlineStatus={isOnline ? 'online' : 'offline'}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-100 truncate">
                  {otherParticipant?.name}
                </h4>
                {lastMsg && (
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-zinc-400 truncate pr-2">
                  {lastMsg?.type === 'story_reply' ? (
                    <span className="italic text-indigo-400">Replied to story...</span>
                  ) : lastMsg?.type === 'image' ? (
                    <span className="italic text-zinc-300">📷 Shared photo</span>
                  ) : (
                    lastMsg?.content || 'No messages yet'
                  )}
                </p>

                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
