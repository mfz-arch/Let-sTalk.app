import { Conversation, Message } from '../types/chat';
import { User } from '../types/user';

class ChatService {
  async getConversations(currentUserId: string): Promise<Conversation[]> {
    try {
      const res = await fetch(`/api/chats/conversations?userId=${encodeURIComponent(currentUserId)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.conversations || [];
    } catch (err) {
      console.error('getConversations error:', err);
      return [];
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const res = await fetch(`/api/chats/messages?conversationId=${encodeURIComponent(conversationId)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch (err) {
      console.error('getMessages error:', err);
      return [];
    }
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    type: 'text' | 'image' | 'audio' | 'story_reply' = 'text',
    mediaUrl?: string,
    storyContext?: Message['storyContext'],
    replyTo?: Message['replyTo']
  ): Promise<Message> {
    const res = await fetch('/api/chats/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        senderId,
        receiverId,
        content,
        type,
        mediaUrl,
        storyContext,
        replyTo,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Send message failed');
    }

    const data = await res.json();
    return data.message;
  }

  async getOrCreateConversation(currentUserId: string, targetUserId: string, currentUser: User): Promise<Conversation> {
    const res = await fetch('/api/chats/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId, targetUserId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Create conversation failed');
    }

    const data = await res.json();
    return data.conversation;
  }

  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    try {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}&currentUserId=${encodeURIComponent(currentUserId)}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.users || [];
    } catch (err) {
      console.error('searchUsers error:', err);
      return [];
    }
  }

  async markAsRead(conversationId: string): Promise<void> {
    // No-op for now
  }
}

export const chatService = new ChatService();
