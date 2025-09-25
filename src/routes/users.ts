import { Router } from 'express';
import { UserController } from '../controllers/userController.ts';
import { authenticateUser } from '../middleware/auth.ts';

const router = Router();
const userController = new UserController();

// GET /api/users/profile - Get current user profile
router.get('/profile', authenticateUser, userController.getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateUser, userController.updateProfile);

export default router;