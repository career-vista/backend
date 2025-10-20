import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { validateRequest } from '../middleware/validate';
import { auth } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Update user profile
router.put(
  '/profile',
  [
    body('name')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .isString()
      .trim()
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone number must be 10 digits'),
    body('class')
      .optional()
      .isInt({ min: 9, max: 12 })
      .withMessage('Class must be between 9 and 12'),
    body('board')
      .optional()
      .isString()
      .isIn(['CBSE', 'ICSE', 'State Board', 'Other'])
      .withMessage('Board must be one of: CBSE, ICSE, State Board, Other'),
    body('state')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2 and 50 characters'),
    body('category')
      .optional()
      .isString()
      .isIn(['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'])
      .withMessage('Category must be one of: General, OBC, SC, ST, EWS, Other'),
    body('interests')
      .optional()
      .isArray()
      .withMessage('Interests must be an array'),
    body('interests.*')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Each interest must be between 2 and 50 characters'),
  ],
  validateRequest,
  userController.updateProfile
);

// Get user test scores
router.get('/test-scores', userController.getTestScores);

// Save academic test and preferences/stream selection
router.post('/save-profile-data', userController.saveTestAndPreferences);

// Consolidated profile summary for dashboard
router.get('/profile-summary', userController.getProfileSummary);

// Get user recommended streams
router.get('/recommended-streams', userController.getRecommendedStreams);

export default router;