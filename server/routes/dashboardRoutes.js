import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('college_admin', 'super_admin', 'student'), getDashboard);

export default router;
