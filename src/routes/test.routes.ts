import express from 'express';
import * as testController from '../controllers/test.controller';
import { auth } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get questions for academic test
router.get('/academic', testController.getAcademicQuestions);

// Submit academic test
router.post('/academic/submit', testController.submitAcademicTest);

// Get test results
router.get('/results/:testId', testController.getTestResults);

// Save test session on violation
router.post('/save-session', testController.saveTestSession);

// Resume test session
router.get('/resume-session', testController.resumeTestSession);

export default router;