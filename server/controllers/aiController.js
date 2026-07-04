import Book from '../models/Book.js';
import BorrowRecord from '../models/BorrowRecord.js';
import aiService from '../services/aiService.js';

// 1. POST /api/ai/chat
export async function handleChat(req, res) {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    // Resolve tenant specific catalog books for context
    const contextBooks = await Book.find({ collegeId: req.user.collegeId });
    const reply = await aiService.chat(messages, contextBooks);
    
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: 'AI chat request failed', error: error.message });
  }
}

// 2. GET /api/ai/recommend-books
export async function handleRecommendBooks(req, res) {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ message: 'Category parameter is required' });
    }

    const contextBooks = await Book.find({ collegeId: req.user.collegeId });
    
    // Resolve user borrow history
    const userRecords = await BorrowRecord.find({ 
      studentPrn: req.user.prn || 'SYS-ADMIN', 
      collegeId: req.user.collegeId 
    });
    const userHistory = userRecords.map(r => r.bookTitle);

    const recommendationText = await aiService.recommendBooks(category, userHistory, contextBooks);
    res.json({ recommendations: recommendationText });
  } catch (error) {
    res.status(500).json({ message: 'Book recommendation failed', error: error.message });
  }
}

// 3. GET /api/ai/recommend-reading
export async function handleRecommendReading(req, res) {
  try {
    const { interest } = req.query;
    if (!interest) {
      return res.status(400).json({ message: 'Interest query is required' });
    }

    const contextBooks = await Book.find({ collegeId: req.user.collegeId });
    const recommendationText = await aiService.recommendReading(interest, contextBooks);
    
    res.json({ recommendations: recommendationText });
  } catch (error) {
    res.status(500).json({ message: 'Reading recommendation failed', error: error.message });
  }
}

// 4. POST /api/ai/check-duplicates
export async function handleCheckDuplicates(req, res) {
  try {
    const contextBooks = await Book.find({ collegeId: req.user.collegeId });
    const duplicates = await aiService.checkDuplicates(contextBooks);
    
    res.json({ duplicates });
  } catch (error) {
    res.status(500).json({ message: 'Duplicate book check failed', error: error.message });
  }
}

// 5. GET /api/ai/predict-demand
export async function handlePredictDemand(req, res) {
  try {
    const contextBooks = await Book.find({ collegeId: req.user.collegeId });
    const historyRecords = await BorrowRecord.find({ collegeId: req.user.collegeId });
    
    const predictionText = await aiService.predictDemand(historyRecords, contextBooks);
    res.json({ predictions: predictionText });
  } catch (error) {
    res.status(500).json({ message: 'Borrow prediction failed', error: error.message });
  }
}

// 6. POST /api/ai/smart-search
export async function handleSmartSearch(req, res) {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const contextBooks = await Book.find({ collegeId: req.user.collegeId });
    const results = await aiService.smartSearch(query, contextBooks);
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Smart search failed', error: error.message });
  }
}

export default {
  handleChat,
  handleRecommendBooks,
  handleRecommendReading,
  handleCheckDuplicates,
  handlePredictDemand,
  handleSmartSearch
};
