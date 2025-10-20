import { Router } from 'express';
import {
  startAdaptiveTest,
  submitAnswer,
  getTestHistory,
} from '../controllers/adaptiveTest.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Adaptive test for 10th class students
router.post('/start', startAdaptiveTest);
router.post('/submit-answer', submitAnswer);
router.get('/history', getTestHistory);

export default router;
