
import { Router } from 'express';
import {
  adminLogin,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  increaseBalance,
  getBalanceRequests,
  approveBalanceRequest,
} from '../controllers/admin.controller';
import { adminAuth } from '../middleware/admin.auth';

const router = Router();

// Admin login
router.post('/login', adminLogin);

// User management
router.get('/users', adminAuth, getAllUsers);
router.post('/users', adminAuth, createUser);
router.put('/users/:id', adminAuth, updateUser);
router.delete('/users/:id', adminAuth, deleteUser);

// Increase user balance
router.post('/users/:id/increase-balance', adminAuth, increaseBalance);

// Balance requests
router.get('/balance-requests', adminAuth, getBalanceRequests);
router.post('/balance-requests/:id/approve', adminAuth, approveBalanceRequest);

export default router;
