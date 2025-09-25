
import { Router } from 'express';
import {
  getLeaderboard,
  getUserProfile,
  requestBalanceUpdate,
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authMiddleware, getUserProfile);
router.get('/leaderboard', getLeaderboard);
router.post('/request-balance-update', authMiddleware, requestBalanceUpdate);

export default router;
