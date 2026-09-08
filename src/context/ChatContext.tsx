'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Conversation, Message } from '../types/chat';
import { User } from '../types/user';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  setActiveConversation: (conv: Conversation | null) => void;
  sendMessage: (
    content: string,
    type?: 'text' | 'image' | 'audio' | 'story_reply',
    mediaUrl?: string,
    storyContext?: Message['storyContext'],
    replyTo?: Message['replyTo']
  ) => Promise<void>;
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
  
  const { socket } = useSocket();

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

    // Silent background poll for conversations every 3 seconds
    const convInterval = setInterval(() => {
      fetchConversations(false);
    }, 3000);

    return () => clearInterval(convInterval);
  }, [fetchConversations]);

  // Join the active conversation's socket room
  useEffect(() => {
    if (socket && activeConversation) {
      socket.emit('join_conversation', activeConversation.id);
    }
  }, [socket, activeConversation]);

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
        if (user) {
          chatService.markAsRead(activeConversation.id, user.id);
        }
      }
    });

    // Silent fast background poll every 1.5 seconds for instant messages across all devices
    const messageInterval = setInterval(async () => {
      if (!activeConversation) return;
      const latestMsgs = await chatService.getMessages(activeConversation.id);
      if (isMounted && latestMsgs) {
        setMessages((prev) => {
          if (
            latestMsgs.length !== prev.length ||
            latestMsgs[latestMsgs.length - 1]?.id !== prev[prev.length - 1]?.id ||
            latestMsgs.some((lm, idx) => prev[idx] && prev[idx].status !== lm.status)
          ) {
            return latestMsgs;
          }
          return prev;
        });
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(messageInterval);
    };
  }, [activeConversation, user]);

  // Listen for real-time incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: Message) => {
      // If the message is for the currently active conversation, append it
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.find((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      // Always update the conversation list to show the latest message and unread badge
      setConversations((prev) => {
        const convExists = prev.some((c) => c.id === message.conversationId);
        
        if (convExists) {
          return prev.map((c) => {
            if (c.id === message.conversationId) {
              const isUnread = activeConversation?.id !== message.conversationId && message.senderId !== user?.id;
              return { 
                ...c, 
                lastMessage: message, 
                updatedAt: message.createdAt,
                unreadCount: isUnread ? (c.unreadCount || 0) + 1 : c.unreadCount
              };
            }
            return c;
          });
        } else {
          // If a new conversation was created that we don't have in our list, refresh the whole list
          fetchConversations(false);
          return prev;
        }
      });
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, activeConversation, user?.id, fetchConversations]);

  const sendMessage = async (
    content: string,
    type: 'text' | 'image' | 'audio' | 'story_reply' = 'text',
    mediaUrl?: string,
    storyContext?: Message['storyContext'],
    replyTo?: Message['replyTo']
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
      storyContext,
      replyTo
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
    if (!user) return;
    await chatService.markAsRead(conversationId, user.id);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
    setMessages((prev) =>
      prev.map((m) => (m.conversationId === conversationId && m.receiverId === user.id ? { ...m, status: 'read' } : m))
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
