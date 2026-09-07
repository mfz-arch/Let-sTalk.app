import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICallSignal extends Document {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  callType: 'audio' | 'video';
  offer?: any;
  answer?: any;
  callerCandidates: any[];
  receiverCandidates: any[];
  status: 'ringing' | 'connected' | 'ended' | 'declined';
  updatedAt: Date;
}

const CallSignalSchema = new Schema(
  {
    callId: { type: String, required: true, unique: true, index: true },
    callerId: { type: String, required: true, index: true },
    callerName: { type: String, required: true },
    callerAvatar: { type: String },
    receiverId: { type: String, required: true, index: true },
    callType: { type: String, enum: ['audio', 'video'], default: 'audio' },
    offer: { type: Schema.Types.Mixed },
    answer: { type: Schema.Types.Mixed },
    callerCandidates: { type: Array, default: [] },
    receiverCandidates: { type: Array, default: [] },
    status: { type: String, enum: ['ringing', 'connected', 'ended', 'declined'], default: 'ringing' },
  },
  { timestamps: true }
);

// Auto expire call signals after 3 minutes
CallSignalSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 });

export const CallSignal = models.CallSignal || model<ICallSignal>('CallSignal', CallSignalSchema);
