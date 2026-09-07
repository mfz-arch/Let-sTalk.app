import { User } from './user';

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'audio' | 'story_reply';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  mediaUrl?: string;
  createdAt: string;
  status: MessageStatus;
  storyContext?: {
    storyId: string;
    storyMediaUrl: string;
  };
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  isTyping?: boolean;
}
