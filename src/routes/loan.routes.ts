import express from 'express';
import { body } from 'express-validator';
import * as loanController from '../controllers/loan.controller';
import { validateRequest } from '../middleware/validate';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all loans with filtering
router.get('/', auth, loanController.getLoans);

// Get loan by ID
router.get('/:id', auth, loanController.getLoanById);

// Get loans by eligibility criteria
router.post('/eligible', 
  auth,
  [
    body('stream').optional(),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('collateral').optional().isBoolean().withMessage('Collateral must be a boolean'),
  ],
  validateRequest,
  loanController.getEligibleLoans
);

// Compare loans
router.post('/compare', 
  auth,
  [
    body('loanIds')
      .isArray({ min: 2, max: 5 })
      .withMessage('You must provide between 2 and 5 loan IDs'),
  ],
  validateRequest,
  loanController.compareLoans
);

// Calculate EMI
router.post('/calculate-emi',
  auth,
  [
    body('principal').isNumeric().withMessage('Principal amount is required'),
    body('interestRate').isNumeric().withMessage('Interest rate is required'),
    body('tenureYears').isNumeric().withMessage('Tenure in years is required'),
  ],
  validateRequest,
  loanController.calculateEMI
);

// Admin routes (would require admin middleware in a real app)
// Add loan
router.post('/',
  auth,
  [
    body('name').notEmpty().withMessage('Loan name is required'),
    body('provider').notEmpty().withMessage('Provider is required'),
    body('interestRate').isNumeric().withMessage('Interest rate must be a number'),
    body('maxAmount').isNumeric().withMessage('Maximum amount must be a number'),
  ],
  validateRequest,
  loanController.addLoan
);

// Update loan
router.put('/:id', auth, loanController.updateLoan);

// Delete loan
router.delete('/:id', auth, loanController.deleteLoan);

export default router;