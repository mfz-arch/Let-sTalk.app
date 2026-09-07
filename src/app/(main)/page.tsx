'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, MessageSquare, ArrowRight, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { StoryBar } from '../../components/home/StoryBar';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { MOCK_USERS } from '../../data/mockData';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, startConversationWithUser, setActiveConversation } = useChat();

  const handleQuickChat = async (targetUserId: string) => {
    if (!user) return;
    const conv = await startConversationWithUser(targetUserId);
    setActiveConversation(conv);
    router.push('/messages');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-zinc-800 relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Let'sTalk Social Hub</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name.split(' ')[0]}! 👋
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 max-w-lg">
              Check out the latest stories from your friends, jump back into private chats, or discover registered users on Let'sTalk.
            </p>
          </div>

          <Link href="/messages">
            <Button variant="primary" leftIcon={<MessageSquare className="w-4 h-4" />}>
              Open Messages
            </Button>
          </Link>
        </div>
      </div>

      {/* Stories Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Recent Stories</span>
          </h3>
          <span className="text-xs text-zinc-500 font-medium">Tap slide to view</span>
        </div>
        <StoryBar />
      </div>

      {/* Grid: Active Conversations + Discover Friends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Chats Card */}
        <div className="glass-panel p-5 rounded-3xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Recent Conversations</span>
            </h3>
            <Link href="/messages" className="text-xs text-indigo-400 font-semibold hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {conversations.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No active chats yet.</p>
          ) : (
            <div className="space-y-2">
              {conversations.slice(0, 3).map((conv) => {
                const other = conv.participants.find((p) => p.id !== user?.id) || conv.participants[0];
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv);
                      router.push('/messages');
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 hover:bg-zinc-800/60 cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Avatar src={other?.avatar || ''} alt={other?.name || 'User'} size="md" showStatus onlineStatus={other?.onlineStatus} />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-zinc-100 truncate">{other?.name}</h4>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{conv.lastMessage?.content || 'No messages'}</p>
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Suggested Friends to Chat */}
        <div className="glass-panel p-5 rounded-3xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Suggested People</span>
            </h3>
            <Link href="/search" className="text-xs text-indigo-400 font-semibold hover:underline flex items-center space-x-1">
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {MOCK_USERS.slice(0, 3).map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/60"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Avatar src={u.avatar} alt={u.name} size="md" showStatus onlineStatus={u.onlineStatus} />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-zinc-100 truncate">{u.name}</h4>
                    <p className="text-[10px] text-zinc-400 truncate">@{u.username}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleQuickChat(u.id)}
                >
                  Chat
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
