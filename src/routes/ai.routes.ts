import express from 'express';
import { auth } from '../middleware/auth';
import * as aiController from '../controllers/ai.controller';

const router = express.Router();

// Stream prediction endpoint - requires completed profile and test
router.get('/predict-stream', auth, aiController.predictOptimalStream);

// Test analysis endpoint - provides detailed analysis of test results
router.get('/analyze-test', auth, aiController.analyzeTestResults);

// Stream narrative endpoint (existing)
router.post('/stream-narrative', aiController.getStreamNarrative);

// Weight explanation endpoint (existing)
router.get('/explain-weights', auth, aiController.explainWeights);

// Salary insights endpoint (existing)
router.post('/salary-insights', aiController.getSalaryInsights);

export default router;