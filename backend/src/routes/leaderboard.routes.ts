import { Router } from 'express';
import { getLeaderboard } from '../controllers/user.controller';

const router = Router();

router.get('/', getLeaderboard);

export default router;
