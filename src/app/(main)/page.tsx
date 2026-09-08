'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, MessageSquare, ArrowRight, TrendingUp, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { chatService } from '../../services/chatService';
import { StoryBar } from '../../components/home/StoryBar';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { User } from '../../types/user';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, startConversationWithUser, setActiveConversation } = useChat();
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user) {
      chatService.searchUsers('', user.id).then((users) => {
        setRegisteredUsers(users);
      });
    }
  }, [user]);

  const handleQuickChat = async (targetUserId: string) => {
    if (!user) return;
    const conv = await startConversationWithUser(targetUserId);
    setActiveConversation(conv);
    router.push('/messages');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-emerald-50/80 p-6 rounded-2xl border border-emerald-200/80 relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300/60 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Let'sTalk Social Hub</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}! 👋
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-lg">
              Check out stories from your contacts, message registered users, or discover people by phone number.
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Stories</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Tap slide to view</span>
        </div>
        <StoryBar />
      </div>

      {/* Grid: Active Conversations + Registered Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Conversations Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Recent Conversations</span>
            </h3>
            <Link href="/messages" className="text-xs text-emerald-600 font-bold hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {conversations.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-700 font-semibold">No active chats yet.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Search for friends by phone number or name to start your first conversation!
              </p>
              <Link href="/search" className="inline-block mt-2">
                <Button size="sm" variant="secondary" leftIcon={<UserPlus className="w-3.5 h-3.5 text-emerald-600" />}>
                  Find Contacts
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.slice(0, 4).map((conv) => {
                const other = conv.participants.find((p) => p.id !== user?.id) || conv.participants[0];
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv);
                      router.push('/messages');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/60 cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Avatar src={other?.avatar || ''} alt={other?.name || 'User'} size="md" showStatus onlineStatus={other?.onlineStatus} />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{other?.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.lastMessage?.content || 'No messages'}</p>
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Registered Users on Let'sTalk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Registered People ({registeredUsers.length})</span>
            </h3>
            <Link href="/search" className="text-xs text-emerald-600 font-bold hover:underline flex items-center space-x-1">
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {registeredUsers.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-700 font-semibold">No other registered users yet.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Invite friends to register on Let'sTalk using their phone number to start chatting.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {registeredUsers.slice(0, 4).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/60 transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Avatar src={u.avatar} alt={u.name} size="md" showStatus onlineStatus={u.onlineStatus} />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{u.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{u.countryCode} {u.phoneNumber}</p>
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
          )}
        </div>
      </div>
    </div>
  );
}
