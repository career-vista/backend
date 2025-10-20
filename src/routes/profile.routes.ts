import { Router } from 'express';
import {
  completeProfile,
  updateProfile,
  getInterestSuggestions,
  syncOfflineData,
  getProfileStatus,
} from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Profile management
router.post('/complete', completeProfile);
router.put('/update', updateProfile);
router.get('/status', getProfileStatus);

// AI-powered features
router.post('/interests/suggestions', getInterestSuggestions);

// Offline sync
router.post('/sync', syncOfflineData);

export default router;
