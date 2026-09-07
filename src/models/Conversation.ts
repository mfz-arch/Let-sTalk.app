import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IConversation extends Document {
  participantIds: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const ConversationSchema = new Schema(
  {
    participantIds: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

export const Conversation = models.Conversation || model<IConversation>('Conversation', ConversationSchema);
