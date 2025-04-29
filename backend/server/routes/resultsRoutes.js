import express from 'express';
import { getResults } from '../controllers/resultsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get ML results for a user's application
router.get('/:userId', protect, getResults);

export default router; 