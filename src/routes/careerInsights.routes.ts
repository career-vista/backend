import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCareerInsights,
  getFutureProofSkills,
  getCourseRecommendations,
  getEmployabilityInsights,
} from '../controllers/careerInsights.controller';
import { getStreamNarrative, explainWeights, getSalaryInsights } from '../controllers/ai.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get detailed career insights for a specific stream
router.get('/insights/:stream', getCareerInsights);

// Get future-proof skills recommendations
router.get('/skills/:stream', getFutureProofSkills);

// Get course recommendations for skill gaps
router.get('/courses/:stream', getCourseRecommendations);

// Get employability insights by region
router.get('/employability/:stream', getEmployabilityInsights);

// AI-enhanced endpoints
router.post('/ai/stream-narrative', getStreamNarrative);
router.post('/ai/explain-weights', explainWeights);
router.post('/ai/salary-insights', getSalaryInsights);

export default router;


