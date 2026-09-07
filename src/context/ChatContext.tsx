'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Conversation, Message } from '../types/chat';
import { User } from '../types/user';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  setActiveConversation: (conv: Conversation | null) => void;
  sendMessage: (content: string, type?: 'text' | 'image' | 'story_reply', mediaUrl?: string, storyContext?: Message['storyContext']) => Promise<void>;
  startConversationWithUser: (targetUserId: string) => Promise<Conversation>;
  markAsRead: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const fetchConversations = useCallback(async (showLoading = true) => {
    if (!user) return;
    if (showLoading) setIsLoadingConversations(true);
    try {
      const convs = await chatService.getConversations(user.id);
      setConversations(convs);
    } finally {
      if (showLoading) setIsLoadingConversations(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations(true);

    // Silent background poll for conversations every 4 seconds
    const convInterval = setInterval(() => {
      fetchConversations(false);
    }, 4000);

    return () => clearInterval(convInterval);
  }, [fetchConversations]);

  // Fetch and poll messages for active conversation
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setIsLoadingMessages(true);

    // Initial load
    chatService.getMessages(activeConversation.id).then((msgs) => {
      if (isMounted) {
        setMessages(msgs);
        setIsLoadingMessages(false);
      }
    });

    // Silent poll every 2.5 seconds
    const messageInterval = setInterval(async () => {
      if (!activeConversation) return;
      const latestMsgs = await chatService.getMessages(activeConversation.id);
      if (isMounted && latestMsgs) {
        setMessages((prev) => {
          // Compare length or IDs to avoid unnecessary re-renders
          if (latestMsgs.length !== prev.length || latestMsgs[latestMsgs.length - 1]?.id !== prev[prev.length - 1]?.id) {
            return latestMsgs;
          }
          return prev;
        });
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(messageInterval);
    };
  }, [activeConversation]);

  const sendMessage = async (
    content: string,
    type: 'text' | 'image' | 'audio' | 'story_reply' = 'text',
    mediaUrl?: string,
    storyContext?: Message['storyContext']
  ) => {
    if (!user || !activeConversation) return;

    const receiver = activeConversation.participants.find((p) => p.id !== user.id);
    if (!receiver) return;

    const newMsg = await chatService.sendMessage(
      activeConversation.id,
      user.id,
      receiver.id,
      content,
      type,
      mediaUrl,
      storyContext
    );

    setMessages((prev) => [...prev, newMsg]);

    // Update conversation list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, lastMessage: newMsg, updatedAt: newMsg.createdAt }
          : c
      )
    );
  };

  const startConversationWithUser = async (targetUserId: string): Promise<Conversation> => {
    if (!user) throw new Error('Unauthenticated');
    const conv = await chatService.getOrCreateConversation(user.id, targetUserId, user);
    await fetchConversations();
    setActiveConversation(conv);
    return conv;
  };

  const markAsRead = async (conversationId: string) => {
    await chatService.markAsRead(conversationId);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isLoadingConversations,
        isLoadingMessages,
        setActiveConversation,
        sendMessage,
        startConversationWithUser,
        markAsRead,
        refreshConversations: fetchConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
