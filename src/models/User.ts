import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  phoneNumber: string;
  countryCode: string;
  password?: string;
  avatar: string;
  bio?: string;
  onlineStatus: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  createdAt: Date;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    countryCode: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: "Hey there! I am using Let'sTalk." },
    onlineStatus: { type: String, enum: ['online', 'offline', 'away'], default: 'online' },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.index({ phoneNumber: 1, countryCode: 1 });

export const User = models.User || model<IUser>('User', UserSchema);
