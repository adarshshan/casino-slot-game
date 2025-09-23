import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username: string;
    password: string;
    balance: number;
    totalSpins: number;
    totalTimeSpent: number;
    totalWagered: number;
    totalWon: number;
    comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 1000 },
    totalSpins: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    totalWagered: { type: Number, default: 0 },
    totalWon: { type: Number, default: 0 },
}, { timestamps: true });

UserSchema.pre<IUser>('save', async function (next) {
    console.log('--- Entering pre(\'save\') hook ---');
    if (!this.isModified('password')) {
        console.log('Password not modified, skipping hashing.');
        return next();
    }
    console.log('Password modified, proceeding with hashing.');
    console.log('Generating salt...');
    const salt = await bcrypt.genSalt(10);
    console.log('Salt generated. Hashing password...');
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed. Exiting pre(\'save\') hook.');
    next();
});

UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
