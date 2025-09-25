import { Request, Response } from 'express';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';

const generateTokens = (userId: string) => {
    if (!userId) {
        console.error('Error: userId is undefined when generating tokens.');
        throw new Error('userId is required to generate tokens');
    }
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '10m' });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET!, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const user = await User.create({ username, password });

        const tokens = generateTokens(user?._id);
        res.status(201).json({ success: true, ...tokens });
    } catch (error) {
        console.log('Error caught in register function:', error as Error)
        res.status(400).json({ success: false, message: 'Error creating user', error });
    }
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        const tokens = generateTokens(user._id);
        res.json({ success: true, ...tokens });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET!) as { userId: string };
        const tokens = generateTokens(decoded.userId);
        res.json({ success: true, ...tokens });
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
};
