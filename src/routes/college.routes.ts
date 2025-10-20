import express from 'express';
import { body } from 'express-validator';
import * as collegeController from '../controllers/college.controller';
import { validateRequest } from '../middleware/validate';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all colleges with filtering
router.get('/', auth, collegeController.getColleges);

// Get college by ID
router.get('/:id', auth, collegeController.getCollegeById);

// Get colleges by stream
router.get('/stream/:stream', auth, collegeController.getCollegesByStream);

// Get colleges by location
router.get('/location/:state', auth, collegeController.getCollegesByLocation);

// Compare colleges
router.post('/compare', 
  auth,
  [
    body('collegeIds')
      .isArray({ min: 2, max: 5 })
      .withMessage('You must provide between 2 and 5 college IDs'),
  ],
  validateRequest,
  collegeController.compareColleges
);

// College predictor (JEE/NEET/EAMCET)
router.post(
  '/predict',
  auth,
  [
    body('exam')
      .isIn(['JEE', 'NEET', 'EAMCET'])
      .withMessage('exam must be JEE, NEET, or EAMCET'),
    body('score')
      .isFloat()
      .withMessage('score must be a number (percentile for JEE, marks for NEET, rank for EAMCET)'),
    body('category')
      .optional()
      .isIn(['General', 'OBC', 'SC', 'ST', 'EWS'])
      .withMessage('invalid category'),
    body('homeState')
      .optional()
      .isString(),
  ],
  validateRequest,
  collegeController.predictColleges
);

// Admin routes (would require admin middleware in a real app)
// Add college
router.post('/',
  auth,
  [
    body('name').notEmpty().withMessage('College name is required'),
    body('location.state').notEmpty().withMessage('State is required'),
    body('location.city').notEmpty().withMessage('City is required'),
    body('type').isIn(['Government', 'Private', 'Deemed']).withMessage('Invalid college type'),
    body('streams').isArray({ min: 1 }).withMessage('At least one stream is required'),
  ],
  validateRequest,
  collegeController.addCollege
);

// Update college
router.put('/:id', auth, collegeController.updateCollege);

// Delete college
router.delete('/:id', auth, collegeController.deleteCollege);

export default router;