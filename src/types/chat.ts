import { User } from './user';

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'audio' | 'story_reply';

export interface MessageReplyContext {
  id: string;
  senderName: string;
  content: string;
  mediaUrl?: string;
  type?: MessageType;
}

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
  replyTo?: MessageReplyContext;
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
