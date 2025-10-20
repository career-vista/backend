import express from 'express';
import { body, query } from 'express-validator';
import * as scholarshipController from '../controllers/scholarship.controller';
import { validateRequest } from '../middleware/validate';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all scholarships with comprehensive filtering
router.get('/', 
  [
    query('search').optional().isString().withMessage('Search must be a string'),
    query('type').optional().isIn(['All', 'Merit', 'Need-based', 'Category', 'State', 'Central', 'Private']).withMessage('Invalid scholarship type'),
    query('sector').optional().isIn(['All', 'Government', 'Corporate', 'Private']).withMessage('Invalid sector'),
    query('minAmount').optional().isNumeric().withMessage('Minimum amount must be a number'),
    query('maxAmount').optional().isNumeric().withMessage('Maximum amount must be a number'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('sort').optional().isIn(['amount', 'deadline', 'name', 'matchScore']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    query('userProfile').optional().isString().withMessage('User profile must be a JSON string'),
  ],
  validateRequest,
  scholarshipController.getScholarships
);

// Get scholarship statistics
router.get('/stats',
  [
    query('userProfile').optional().isString().withMessage('User profile must be a JSON string'),
  ],
  validateRequest,
  scholarshipController.getScholarshipStats
);

// Get scholarship by ID
router.get('/:id', 
  [
    query('userProfile').optional().isString().withMessage('User profile must be a JSON string'),
  ],
  validateRequest,
  scholarshipController.getScholarshipById
);

// Get scholarships by eligibility criteria (POST for complex user profile)
router.post('/eligible', 
  [
    body('userProfile').notEmpty().withMessage('User profile is required'),
    body('userProfile.category').notEmpty().withMessage('User category is required'),
    body('userProfile.percentage').isNumeric().withMessage('Percentage must be a number'),
    body('userProfile.familyIncome').isNumeric().withMessage('Family income must be a number'),
    body('userProfile.course').notEmpty().withMessage('Course is required'),
    body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  ],
  validateRequest,
  scholarshipController.getEligibleScholarships
);

// Admin routes (would require admin middleware in a real app)

// Add single scholarship
router.post('/',
  auth,
  [
    body('name').notEmpty().withMessage('Scholarship name is required'),
    body('provider').notEmpty().withMessage('Provider is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('type').isIn(['Merit', 'Need-based', 'Category', 'State', 'Central', 'Private']).withMessage('Invalid scholarship type'),
    body('eligibility').notEmpty().withMessage('Eligibility criteria is required'),
    body('eligibility.minPercentage').isNumeric().withMessage('Minimum percentage must be a number'),
    body('eligibility.categories').isArray().withMessage('Categories must be an array'),
    body('eligibility.courses').isArray().withMessage('Courses must be an array'),
    body('applicationDeadline').notEmpty().withMessage('Application deadline is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('website').isURL().withMessage('Website must be a valid URL'),
    body('documentsRequired').isArray().withMessage('Documents required must be an array'),
  ],
  validateRequest,
  scholarshipController.addScholarship
);

// Bulk add scholarships
router.post('/bulk',
  auth,
  [
    body('scholarships').isArray().withMessage('Scholarships must be an array'),
    body('scholarships.*.name').notEmpty().withMessage('Each scholarship must have a name'),
    body('scholarships.*.provider').notEmpty().withMessage('Each scholarship must have a provider'),
    body('scholarships.*.amount').isNumeric().withMessage('Each scholarship amount must be a number'),
    body('scholarships.*.type').isIn(['Merit', 'Need-based', 'Category', 'State', 'Central', 'Private']).withMessage('Invalid scholarship type'),
  ],
  validateRequest,
  scholarshipController.bulkAddScholarships
);

// Update scholarship
router.put('/:id', 
  auth, 
  [
    body('name').optional().notEmpty().withMessage('Scholarship name cannot be empty'),
    body('provider').optional().notEmpty().withMessage('Provider cannot be empty'),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('type').optional().isIn(['Merit', 'Need-based', 'Category', 'State', 'Central', 'Private']).withMessage('Invalid scholarship type'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
  ],
  validateRequest,
  scholarshipController.updateScholarship
);

// Delete scholarship
router.delete('/:id', auth, scholarshipController.deleteScholarship);

export default router;