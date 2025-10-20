import { Router } from 'express';
import {
  predictColleges,
  getCollegeDetails,
  compareColleges,
  getWhatIfScenarios,
} from '../controllers/collegePredictor.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);
router.post('/predict', predictColleges);
router.get('/college/:collegeId', getCollegeDetails);
router.post('/compare', compareColleges);
router.post('/what-if', getWhatIfScenarios);

export default router;
