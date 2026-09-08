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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <Users className="w-6 h-6 text-emerald-600" />
          <span>Discover Registered Users</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          Search for friends on Let'sTalk by name, username, or phone number and start private messaging.
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="relative">
        <SearchIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, @username, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none border border-slate-200 focus:border-emerald-500 focus:bg-white transition-colors shadow-xs"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          All Users ({results.length})
        </button>

        <button
          onClick={() => setActiveTab('online')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
            activeTab === 'online'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>Online Now</span>
        </button>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <UserCheck className="w-10 h-10 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">No registered users found</h3>
            <p className="text-xs text-slate-500 max-w-xs">
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
