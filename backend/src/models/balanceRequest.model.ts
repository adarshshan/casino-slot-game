
import mongoose, { Schema, Document } from 'mongoose';

export interface IBalanceRequest extends Document {
  user: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const BalanceRequestSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IBalanceRequest>('BalanceRequest', BalanceRequestSchema);
