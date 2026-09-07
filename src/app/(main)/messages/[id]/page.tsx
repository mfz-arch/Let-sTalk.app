'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChat } from '../../../../context/ChatContext';
import { ChatWindow } from '../../../../components/chat/ChatWindow';

export default function DirectChatPage() {
  const params = useParams();
  const router = useRouter();
  const { conversations, activeConversation, setActiveConversation, messages, isLoadingMessages, sendMessage } = useChat();

  const conversationId = params?.id as string;

  useEffect(() => {
    if (conversationId && (!activeConversation || activeConversation.id !== conversationId)) {
      const found = conversations.find((c) => c.id === conversationId);
      if (found) {
        setActiveConversation(found);
      }
    }
  }, [conversationId, conversations, activeConversation, setActiveConversation]);

  if (!activeConversation) {
    return (
      <div className="h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-3">
        <p className="text-sm text-zinc-400">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] md:h-screen flex flex-col">
      <ChatWindow
        conversation={activeConversation}
        messages={messages}
        isLoading={isLoadingMessages}
        onSendMessage={(text, mediaUrl) => sendMessage(text, 'text', mediaUrl)}
        onBackMobile={() => router.push('/messages')}
      />
    </div>
  );
}
