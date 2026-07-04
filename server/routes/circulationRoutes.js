import express from 'express';
import { 
  requestIssue, 
  approveIssue, 
  rejectIssue, 
  requestReturn, 
  approveReturn, 
  createReservation, 
  cancelReservation, 
  listUserRecords, 
  listAllRecords, 
  getReports 
} from '../controllers/circulationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student circulation actions
router.post('/issues/request', authenticate, requestIssue);
router.put('/returns/:recordId/request', authenticate, requestReturn);
router.post('/reservations', authenticate, createReservation);
router.put('/reservations/:reservationId/cancel', authenticate, cancelReservation);
router.get('/history/:prn', authenticate, listUserRecords);

// Librarian/Admin actions
router.put('/issues/:recordId/approve', authenticate, authorize('librarian', 'college_admin', 'admin'), approveIssue);
router.put('/issues/:recordId/reject', authenticate, authorize('librarian', 'college_admin', 'admin'), rejectIssue);
router.put('/returns/:recordId/approve', authenticate, authorize('librarian', 'college_admin', 'admin'), approveReturn);
router.get('/registry', authenticate, authorize('librarian', 'college_admin', 'admin'), listAllRecords);
router.get('/reports', authenticate, authorize('librarian', 'college_admin', 'admin'), getReports);

export default router;
