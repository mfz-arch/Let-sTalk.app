import { Conversation, Message } from '../types/chat';
import { User } from '../types/user';
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES, MOCK_USERS } from '../data/mockData';

class ChatService {
  private conversations: Conversation[] = [...INITIAL_CONVERSATIONS];
  private messagesMap: Record<string, Message[]> = { ...INITIAL_MESSAGES };

  async getConversations(currentUserId: string): Promise<Conversation[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.conversations.filter((c) => c.participantIds.includes(currentUserId));
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.messagesMap[conversationId] || [];
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
    await new Promise((resolve) => setTimeout(resolve, 150));

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

    if (!this.messagesMap[conversationId]) {
      this.messagesMap[conversationId] = [];
    }
    this.messagesMap[conversationId].push(newMessage);

    // Update conversation lastMessage & updatedAt
    const convIndex = this.conversations.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      this.conversations[convIndex] = {
        ...this.conversations[convIndex],
        lastMessage: newMessage,
        updatedAt: newMessage.createdAt,
      };
    }

    return newMessage;
  }

  async getOrCreateConversation(currentUserId: string, targetUserId: string, currentUser: User): Promise<Conversation> {
    const existing = this.conversations.find(
      (c) => c.participantIds.includes(currentUserId) && c.participantIds.includes(targetUserId)
    );

    if (existing) return existing;

    const targetUser = MOCK_USERS.find((u) => u.id === targetUserId);
    if (!targetUser) throw new Error('Target user not found');

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      participantIds: [currentUserId, targetUserId],
      participants: [currentUser, targetUser],
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    this.conversations.unshift(newConv);
    this.messagesMap[newConv.id] = [];
    return newConv;
  }

  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (!query.trim()) return MOCK_USERS.filter((u) => u.id !== currentUserId);

    const q = query.toLowerCase().trim();
    return MOCK_USERS.filter(
      (u) =>
        u.id !== currentUserId &&
        (u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.phoneNumber.includes(q))
    );
  }

  async markAsRead(conversationId: string): Promise<void> {
    const convIndex = this.conversations.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      this.conversations[convIndex].unreadCount = 0;
    }
  }
}

export const chatService = new ChatService();
