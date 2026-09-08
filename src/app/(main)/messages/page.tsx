'use client';

import React, { useState } from 'react';
import { useChat } from '../../../context/ChatContext';
import { ConversationList } from '../../../components/chat/ConversationList';
import { ChatWindow } from '../../../components/chat/ChatWindow';
import { ChatEmptyState } from '../../../components/chat/ChatEmptyState';
import { Search } from 'lucide-react';

export default function MessagesPage() {
  const {
    conversations,
    activeConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    setActiveConversation,
    sendMessage,
    markAsRead,
  } = useChat();

  const [searchFilter, setSearchFilter] = useState('');

  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return c.participants.some(
      (p) => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
    );
  });

  const handleSelectConv = (conv: typeof activeConversation) => {
    setActiveConversation(conv);
    if (conv) {
      markAsRead(conv.id);
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] md:h-screen flex overflow-hidden">
      {/* Conversation Sidebar List (Desktop always visible, Mobile hidden if active chat selected) */}
      <div
        className={`w-full md:w-80 lg:w-96 flex flex-col bg-white border-r border-slate-200 flex-shrink-0 ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Messages Search Bar Header */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Messages</h2>
            <span className="text-[11px] text-emerald-700 font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none border border-slate-200 focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ConversationList
          conversations={filteredConversations}
          activeId={activeConversation?.id}
          onSelect={handleSelectConv}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Main Chat Screen Window (Desktop default empty state, Mobile active chat) */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 ${
          !activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            isLoading={isLoadingMessages}
            onSendMessage={(text, mediaUrl) => sendMessage(text, 'text', mediaUrl)}
            onBackMobile={() => setActiveConversation(null)}
          />
        ) : (
          <ChatEmptyState />
        )}
      </div>
    </div>
  );
}
