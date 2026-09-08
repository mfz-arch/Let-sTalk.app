'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, Users, UserCheck } from 'lucide-react';
import { User } from '../../../types/user';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';
import { chatService } from '../../../services/chatService';
import { UserSearchCard } from '../../../components/search/UserSearchCard';
import { Skeleton } from '../../../components/common/Skeleton';

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { startConversationWithUser, setActiveConversation } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'online'>('all');

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      const users = await chatService.searchUsers(searchQuery, user.id);
      setResults(users);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  const handleMessageUser = async (targetUser: User) => {
    if (!user) return;
    const conv = await startConversationWithUser(targetUser.id);
    setActiveConversation(conv);
    router.push('/messages');
  };

  const filteredResults = results.filter((u) => {
    if (activeTab === 'online') return u.onlineStatus === 'online';
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Users className="w-6 h-6 text-indigo-400" />
          <span>Discover Registered Users</span>
        </h1>
        <p className="text-xs md:text-sm text-zinc-400">
          Search for friends on Let'sTalk by name, username, or phone number and start private messaging.
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="relative">
        <SearchIcon className="w-5 h-5 absolute left-4 top-3.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by name, @username, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1A1D24] rounded-xl pl-12 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none border border-white/[0.07] focus:border-indigo-500/50 transition-colors shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1.5 bg-[#12141A] p-1 rounded-xl border border-white/[0.07] w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          All Users ({results.length})
        </button>

        <button
          onClick={() => setActiveTab('online')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === 'online'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Online Now</span>
        </button>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl bg-[#1A1D24]" />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-[#12141A] rounded-2xl border border-white/[0.07] space-y-3">
            <UserCheck className="w-10 h-10 text-zinc-600" />
            <h3 className="text-sm font-semibold text-zinc-300">No registered users found</h3>
            <p className="text-xs text-zinc-500 max-w-xs">
              Try searching with a different keyword or phone number.
            </p>
          </div>
        ) : (
          filteredResults.map((u) => (
            <UserSearchCard key={u.id} user={u} onMessageClick={handleMessageUser} />
          ))
        )}
      </div>
    </div>
  );
}
