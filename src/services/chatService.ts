import { Conversation, Message } from '../types/chat';
import { User } from '../types/user';
import { authService } from './authService';

class ChatService {
  private getStoredConversations(): Conversation[] {
    if (typeof window === 'undefined') return [];
    const str = localStorage.getItem('letstalk_conversations');
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  }

  private saveConversations(conversations: Conversation[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('letstalk_conversations', JSON.stringify(conversations));
  }

  private getStoredMessages(): Record<string, Message[]> {
    if (typeof window === 'undefined') return {};
    const str = localStorage.getItem('letstalk_messages');
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  }

  private saveMessages(messagesMap: Record<string, Message[]>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('letstalk_messages', JSON.stringify(messagesMap));
  }

  async getConversations(currentUserId: string): Promise<Conversation[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const conversations = this.getStoredConversations();
    return conversations.filter((c) => c.participantIds.includes(currentUserId));
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const messagesMap = this.getStoredMessages();
    return messagesMap[conversationId] || [];
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    type: 'text' | 'image' | 'story_reply' = 'text',
    mediaUrl?: string,
    storyContext?: Message['storyContext']
  ): Promise<Message> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      conversationId,
      senderId,
      receiverId,
      content,
      type,
      mediaUrl,
      storyContext,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    const messagesMap = this.getStoredMessages();
    if (!messagesMap[conversationId]) {
      messagesMap[conversationId] = [];
    }
    messagesMap[conversationId].push(newMessage);
    this.saveMessages(messagesMap);

    const conversations = this.getStoredConversations();
    const convIndex = conversations.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      conversations[convIndex] = {
        ...conversations[convIndex],
        lastMessage: newMessage,
        updatedAt: newMessage.createdAt,
      };
      this.saveConversations(conversations);
    }

    return newMessage;
  }

  async getOrCreateConversation(currentUserId: string, targetUserId: string, currentUser: User): Promise<Conversation> {
    const conversations = this.getStoredConversations();
    const existing = conversations.find(
      (c) => c.participantIds.includes(currentUserId) && c.participantIds.includes(targetUserId)
    );

    if (existing) return existing;

    const registeredUsers = authService.getRegisteredUsers();
    const targetUser = registeredUsers.find((u) => u.id === targetUserId);
    if (!targetUser) throw new Error('Target user not found');

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      participantIds: [currentUserId, targetUserId],
      participants: [currentUser, targetUser],
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    conversations.unshift(newConv);
    this.saveConversations(conversations);

    const messagesMap = this.getStoredMessages();
    messagesMap[newConv.id] = [];
    this.saveMessages(messagesMap);

    return newConv;
  }

  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const registeredUsers = authService.getRegisteredUsers();
    const otherUsers = registeredUsers.filter((u) => u.id !== currentUserId);

    if (!query.trim()) return otherUsers;

    const q = query.toLowerCase().trim();
    return otherUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.phoneNumber.includes(q) ||
        (u.countryCode + u.phoneNumber).includes(q)
    );
  }

  async markAsRead(conversationId: string): Promise<void> {
    const conversations = this.getStoredConversations();
    const convIndex = conversations.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      conversations[convIndex].unreadCount = 0;
      this.saveConversations(conversations);
    }
  }
}

export const chatService = new ChatService();
