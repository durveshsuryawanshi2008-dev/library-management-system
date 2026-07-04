import express from 'express';
import { 
  handleChat, 
  handleRecommendBooks, 
  handleRecommendReading, 
  handleCheckDuplicates, 
  handlePredictDemand, 
  handleSmartSearch 
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', authenticate, handleChat);
router.get('/recommend-books', authenticate, handleRecommendBooks);
router.get('/recommend-reading', authenticate, handleRecommendReading);
router.post('/check-duplicates', authenticate, handleCheckDuplicates);
router.get('/predict-demand', authenticate, handlePredictDemand);
router.post('/smart-search', authenticate, handleSmartSearch);

export default router;
