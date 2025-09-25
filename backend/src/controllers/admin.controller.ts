
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import BalanceRequest from '../models/balanceRequest.model';
import { redisClient } from '../config/redis';


// Hardcoded admin credentials
const ADMIN_USERNAME = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

export const adminLogin = (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username: ADMIN_USERNAME, role: 'admin' }, process.env.JWT_ADMIN_SECRET || 'admin_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const cacheKey = `users:${userId}:list`;

    const cachedUsers = await redisClient?.get(cacheKey);

    if (cachedUsers) {
      return res.status(200).json({ success: true, users: JSON.parse(cachedUsers) });
    }
    const users = await User.find({}, '-password'); // Exclude passwords from the result
    if (users) {
      res.status(200).json({ success: true, users });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, balance } = req.body;
    const newUser = new User({ username, password, balance });
    await newUser.save();
    res.status(201).json({ success: true, newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating user', error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, balance } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, { username, balance }, { new: true });
    res.status(200).json({ success: true, updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user', error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user', error });
  }
};

export const increaseBalance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const user = await User.findById(id);

    if (user) {
      user.balance += amount;
      await user.save();
      res.status(200).json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error increasing balance', error });
  }
};

export const getBalanceRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const cacheKey = `users:${userId}:list`;

    const cachedRequests = await redisClient?.get(cacheKey);
    if (cachedRequests) {
      return res.status(200).json({ success: true, requests: JSON.parse(cachedRequests) });
    }

    const requests = await BalanceRequest.find().populate('user', 'username');
    if (requests) {
      res.status(200).json({ success: true, requests });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching balance requests', error });
  }
};

export const approveBalanceRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await BalanceRequest.findById(id);

    if (request) {
      request.status = 'approved';
      await request.save();

      const user = await User.findById(request.user);
      if (user) {
        // You can add a specific amount to be increased or a default value.
        user.balance += 100; // Increase balance by a fixed amount for this example
        await user.save();
      }

      res.status(200).json({ success: true, message: 'Balance request approved' });
    } else {
      res.status(404).json({ success: false, message: 'Balance request not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving balance request', error });
  }
};
