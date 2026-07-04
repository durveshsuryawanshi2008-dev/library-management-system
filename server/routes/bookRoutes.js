import express from 'express';
import { listBooks, createBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('college_admin', 'super_admin'), listBooks);
router.post('/', authenticate, authorize('college_admin', 'super_admin'), createBook);
router.put('/:bookId', authenticate, authorize('college_admin', 'super_admin'), updateBook);
router.delete('/:bookId', authenticate, authorize('college_admin', 'super_admin'), deleteBook);

export default router;
