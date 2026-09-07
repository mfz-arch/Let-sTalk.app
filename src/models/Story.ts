import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IStory extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  mediaUrl: string;
  caption?: string;
  type: 'image' | 'video';
  viewsCount: number;
  likes: string[];
  createdAt: Date;
}

const StorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    mediaUrl: { type: String, required: true },
    caption: { type: String },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    viewsCount: { type: Number, default: 1 },
    likes: [{ type: String }],
  },
  { timestamps: true }
);

// Auto expire stories after 24 hours (86400 seconds)
StorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const Story = models.Story || model<IStory>('Story', StorySchema);
