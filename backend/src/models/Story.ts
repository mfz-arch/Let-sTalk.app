import mongoose, { Schema, Document } from 'mongoose';

export interface IStorySlide {
  _id?: mongoose.Types.ObjectId;
  mediaUrl: string;
  caption?: string;
  viewsCount: number;
  viewers: mongoose.Types.ObjectId[];
  createdAt: Date;
}

export interface IStoryGroup extends Document {
  userId: mongoose.Types.ObjectId;
  slides: IStorySlide[];
  updatedAt: Date;
}

const StorySlideSchema = new Schema(
  {
    mediaUrl: { type: String, required: true },
    caption: { type: String },
    viewsCount: { type: Number, default: 0 },
    viewers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const StoryGroupSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    slides: [StorySlideSchema],
  },
  { timestamps: true }
);

export const StoryGroup = mongoose.model<IStoryGroup>('StoryGroup', StoryGroupSchema);
