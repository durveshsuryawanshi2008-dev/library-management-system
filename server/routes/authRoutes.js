import express from 'express';
import { registerCollege, approveCollege, login, refresh, logout } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerCollege);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.put('/colleges/:collegeId/approve', authenticate, authorize('super_admin'), approveCollege);

export default router;
