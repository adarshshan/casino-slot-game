
import { Request, Response } from 'express';
import User from '../models/user.model';
import BalanceRequest from '../models/balanceRequest.model';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // Assuming you have the user's ID from the authenticated session
    console.log('req as any).user....')
    console.log((req as any).user)
    const userId = (req as any).user.userId; // This needs to be set by an authentication middleware
    const user = await User.findById(userId, '-password');

    if (user) {
      res.status(200).json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user profile', error });
  }
};

export const requestBalanceUpdate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId; // This needs to be set by an authentication middleware
    const newRequest = new BalanceRequest({ user: userId });
    await newRequest.save();
    res.status(201).json({ success: true, message: 'Balance update request submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting balance update request', error });
  }
};
