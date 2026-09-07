import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participantIds: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  unreadCounts: Map<string, number>;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    participantIds: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    unreadCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

ConversationSchema.index({ participantIds: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
