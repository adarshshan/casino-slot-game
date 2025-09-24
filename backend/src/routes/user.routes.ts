
import { Router } from 'express';
import {
  getUserProfile,
  requestBalanceUpdate,
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Get user profile
router.get('/profile', authMiddleware, getUserProfile);

// Request balance update
router.post('/request-balance-update', authMiddleware, requestBalanceUpdate);

export default router;
