import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    spinResult: string[];
    winAmount: number;
    timestamp: Date;
}

const TransactionSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    spinResult: { type: [String], required: true },
    winAmount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
