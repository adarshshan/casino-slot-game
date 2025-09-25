
import { Request, Response } from 'express';
import User from '../models/user.model';
import BalanceRequest from '../models/balanceRequest.model';
import { redisClient } from '../config/redis'; // Import redisClient

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const cacheKey = `user:${userId}:profile`;

    // Try to get data from cache
    const cachedUser = await redisClient?.get(cacheKey);

    if (cachedUser) {
      return res.status(200).json({ success: true, user: JSON.parse(cachedUser) });
    }

    // If not in cache, fetch from DB
    const user = await User.findById(userId, '-password');

    if (user) {
      // Store in cache with a TTL (e.g., 60 seconds)
      await redisClient?.setEx(cacheKey, 60, JSON.stringify(user));
      res.status(200).json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Error fetching user profile', error });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  const redisClient = (req as any).redis;
  const days = parseInt(req.query.days as string) || 7;
  const cacheKey = `leaderboard:${days}`;

  try {
    const cachedLeaderboard = await redisClient.get(cacheKey);
    if (cachedLeaderboard) {
      const parsedLeaderboard = JSON.parse(cachedLeaderboard);
      return res.json({ success: true, leaderboard: [...parsedLeaderboard] });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const leaderboard = await User.aggregate([
      {
        $match: {
          updatedAt: { $gte: since },
        },
      },
      {
        $project: {
          username: 1,
          netWin: { $subtract: ['$totalWon', '$totalWagered'] },
        },
      },
      {
        $sort: { netWin: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    await redisClient.setEx(cacheKey, 120, JSON.stringify(leaderboard));

    res.json({ success: true, leaderboard: [...leaderboard] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};


export const requestBalanceUpdate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const newRequest = new BalanceRequest({ user: userId });
    await newRequest.save();
    res.status(201).json({ success: true, message: 'Balance update request submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting balance update request', error });
  }
};
