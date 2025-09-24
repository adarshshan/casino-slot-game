import { Request, Response } from 'express';
import User from '../models/user.model';

export const getLeaderboard = async (req: Request, res: Response) => {
    const redisClient = (req as any).redis;
    const days = parseInt(req.query.days as string) || 7;
    const cacheKey = `leaderboard:${days}`;

    try {
        const cachedLeaderboard = await redisClient.get(cacheKey);
        if (cachedLeaderboard) {
            const parsedLeaderboard = JSON.parse(cachedLeaderboard);
            return res.json({ success: true, ...parsedLeaderboard });
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

        res.json({ success: true, leaderboard });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};
