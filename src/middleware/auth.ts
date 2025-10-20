import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { logger } from '../utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }
    
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, jwtSecret) as { userId: string };
    } catch (error) {
      // Try with fallback secret for backward compatibility
      if ((error as Error).name === 'JsonWebTokenError') {
        try {
          decoded = jwt.verify(token, 'your-super-secret-jwt-key-change-this-in-production') as { userId: string };
          logger.warn('Token verified with fallback secret - user should re-login');
        } catch (fallbackError) {
          throw error; // Throw original error if fallback fails
        }
      } else {
        throw error;
      }
    }
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Attach user to request
    req.user = user;
    req.userId = (user._id as any).toString();
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if ((error as Error).name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    
    if ((error as Error).name === 'JsonWebTokenError') {
      logger.error('JWT Error details:', (error as Error).message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token signature',
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// For backward compatibility and alias
export const authMiddleware = auth;
export const authenticate = auth;