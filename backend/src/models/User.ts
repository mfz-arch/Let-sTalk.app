import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

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
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
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

// Compound index for unique phone + countryCode
UserSchema.index({ phoneNumber: 1, countryCode: 1 }, { unique: true });

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next: (err?: Error) => void) {
  const user = this as any;
  if (!user.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password!, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  const user = this as any;
  return await bcrypt.compare(enteredPassword, user.password || '');
};

export const User = mongoose.model<IUser>('User', UserSchema);
