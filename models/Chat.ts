import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  type: 'direct' | 'group';
  participants: mongoose.Types.ObjectId[];
  name?: string;
  avatar?: string;
  admin?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema(
  {
    type: { type: String, enum: ['direct', 'group'], default: 'direct' },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    name: { type: String },
    avatar: { type: String },
    admin: { type: Schema.Types.ObjectId, ref: 'User' },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
