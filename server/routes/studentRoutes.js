import express from 'express';
import { listStudents, createStudent } from '../controllers/studentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('college_admin', 'super_admin'), listStudents);
router.post('/', authenticate, authorize('college_admin', 'super_admin'), createStudent);

export default router;
