import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'audio' | 'story_reply';
  mediaUrl?: string;
  storyContext?: {
    storyId: string;
    storyMediaUrl: string;
  };
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
    mediaUrl?: string;
    type?: string;
  };
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
}

const MessageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    type: { type: String, enum: ['text', 'image', 'audio', 'story_reply'], default: 'text' },
    mediaUrl: { type: String },
    storyContext: {
      storyId: { type: String },
      storyMediaUrl: { type: String },
    },
    replyTo: {
      id: { type: String },
      senderName: { type: String },
      content: { type: String },
      mediaUrl: { type: String },
      type: { type: String },
    },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  },
  { timestamps: true }
);

export const Message = models.Message || model<IMessage>('Message', MessageSchema);
