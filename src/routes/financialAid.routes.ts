import { Router } from 'express';
import {
  getFinancialAidRecommendations,
  calculateLoanEMI,
  getScholarshipDetails,
  generateFinancialReport,
  exportFinancialReport,
} from '../controllers/financialAid.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Financial aid recommendations
router.get('/recommendations', getFinancialAidRecommendations);
router.post('/loan/calculate-emi', calculateLoanEMI);
router.get('/scholarship/:scholarshipId', getScholarshipDetails);

// Financial reports
router.post('/report/generate', generateFinancialReport);
router.post('/report/export', exportFinancialReport);

export default router;
