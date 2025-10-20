import express from 'express';
import { body, oneOf } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate';

const router = express.Router();

// Simple test route that doesn't use any controller
router.get('/simple-test', (req, res) => {
  res.json({ success: true, message: 'Simple auth route working!' });
});

// Send OTP for login
router.post(
  '/send-otp',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
  ],
  validateRequest,
  authController.sendOtp
);

// Verify OTP and login
router.post(
  '/verify-otp',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must contain only numbers'),
  ],
  validateRequest,
  authController.verifyOtp
);

// Register with password
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters long'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  validateRequest,
  authController.registerWithPassword
);

// Login with password
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validateRequest,
  authController.loginWithPassword
);

// Google Sign In
router.post(
  '/google',
  // Temporarily remove validation to debug
  authController.googleSignIn
);

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes are working!' });
});

// Get current user
router.get('/me', authController.getCurrentUser);

// Logout
router.post('/logout', authController.logout);

// Get client configuration
router.get('/config', authController.getClientConfig);

export default router;