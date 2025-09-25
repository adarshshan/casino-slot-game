import { Request, Response } from 'express';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';

const generateTokens = (userId: string) => {
    if (!userId) {
        console.error('Error: userId is undefined when generating tokens.');
        throw new Error('userId is required to generate tokens');
    }
    // const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1m' });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET!, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
    console.log('Incoming registration request body:', req.body);
    const { username, password } = req.body;
    console.log('...username, password....')
    console.log(username, password)
    console.log("hello world...........")
    try {
        console.log("inside the trycatch block ...........")
        console.log('Attempting to create user...');
        const user = await User.create({ username, password });
        console.log('User created successfully:', user);

        console.log(user)
        const tokens = generateTokens(user?._id);
        console.log('this is the token...', tokens)
        res.status(201).json({ success: true, ...tokens });
    } catch (error) {
        console.log('Error caught in register function:', error as Error)
        console.log('this is reached here')
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
