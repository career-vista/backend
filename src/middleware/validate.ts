import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to validate request data using express-validator
 * Checks for validation errors and returns a 400 response if any are found
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error: any) => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  
  next();
};