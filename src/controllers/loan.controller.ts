import { Request, Response } from 'express';
import Loan from '../models/Loan';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Get all loans with filtering
 */
export const getLoans = async (req: Request, res: Response) => {
  try {
    const {
      provider,
      type,
      minInterestRate,
      maxInterestRate,
      minAmount,
      maxAmount,
      collateral,
      limit = 20,
      page = 1,
      sort = 'interestRate',
    } = req.query;

    // Build query
    const query: any = {};

    if (provider) query.provider = provider;
    if (type) query.type = type;
    if (collateral !== undefined) query.collateralRequired = collateral === 'true';
    
    // Interest rate range
    if (minInterestRate || maxInterestRate) {
      query.interestRate = {};
      if (minInterestRate) query.interestRate.$gte = Number(minInterestRate);
      if (maxInterestRate) query.interestRate.$lte = Number(maxInterestRate);
    }
    
    // Amount range
    if (minAmount || maxAmount) {
      query.maxAmount = {};
      if (minAmount) query.maxAmount.$gte = Number(minAmount);
      if (maxAmount) query.maxAmount.$lte = Number(maxAmount);
    }

    // Count total documents for pagination
    const total = await Loan.countDocuments(query);

    // Execute query with pagination and sorting
    const loans = await Loan.find(query)
      .sort({ [sort as string]: sort === 'interestRate' ? 1 : 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      success: true,
      count: loans.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: loans,
    });
  } catch (error) {
    logger.error('Error getting loans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get loans',
    });
  }
};

/**
 * Get loan by ID
 */
export const getLoanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid loan ID',
      });
    }

    const loan = await Loan.findById(id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    logger.error('Error getting loan by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get loan',
    });
  }
};

/**
 * Get loans by eligibility criteria
 */
export const getEligibleLoans = async (req: Request, res: Response) => {
  try {
    const { stream, amount, collateral } = req.body;
    const { limit = 20, page = 1 } = req.query;

    // Build query based on provided criteria
    const query: any = {};

    // Stream-based eligibility
    if (stream) {
      query.$or = [
        { 'eligibility.stream': stream },
        { 'eligibility.stream': { $exists: false } },
        { 'eligibility.stream': 'Any' },
      ];
    }

    // Amount-based eligibility
    if (amount) {
      query.maxAmount = { $gte: amount };
    }

    // Collateral-based filtering
    if (collateral !== undefined) {
      query.collateralRequired = collateral;
    }

    // Count total documents for pagination
    const total = await Loan.countDocuments(query);

    // Execute query with pagination
    const loans = await Loan.find(query)
      .sort({ interestRate: 1 }) // Sort by interest rate (lowest first)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      success: true,
      count: loans.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: loans,
    });
  } catch (error) {
    logger.error('Error getting eligible loans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get eligible loans',
    });
  }
};

/**
 * Compare loans
 */
export const compareLoans = async (req: Request, res: Response) => {
  try {
    const { loanIds } = req.body;

    // Validate ObjectIds
    for (const id of loanIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid loan ID: ${id}`,
        });
      }
    }

    // Get loans
    const loans = await Loan.find({ _id: { $in: loanIds } });

    // Check if all loans were found
    if (loans.length !== loanIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more loans not found',
      });
    }

    // Prepare comparison data
    const comparisonData = loans.map(loan => ({
      id: loan._id,
      name: loan.name,
      provider: loan.provider,
      type: loan.type,
      interestRate: loan.interestRate,
      maxAmount: (loan as any).maxAmount || loan.amount || 0,
      tenure: loan.tenure,
      processingFee: loan.processingFee,
      collateralRequired: (loan as any).collateralRequired || false,
      repaymentTerms: (loan as any).repaymentTerms || 'Standard terms',
      website: loan.website,
    }));

    res.status(200).json({
      success: true,
      data: comparisonData,
    });
  } catch (error) {
    logger.error('Error comparing loans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare loans',
    });
  }
};

/**
 * Calculate EMI
 */
export const calculateEMI = async (req: Request, res: Response) => {
  try {
    const { principal, interestRate, tenureYears } = req.body;

    // Convert annual interest rate to monthly and decimal form
    const monthlyInterestRate = interestRate / (12 * 100);
    
    // Convert tenure from years to months
    const tenureMonths = tenureYears * 12;
    
    // Calculate EMI using formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths) / 
               (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);
    
    // Calculate total payment and interest
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;
    
    res.status(200).json({
      success: true,
      data: {
        emi: Math.round(emi * 100) / 100, // Round to 2 decimal places
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        principal,
        interestRate,
        tenureYears,
        tenureMonths,
      },
    });
  } catch (error) {
    logger.error('Error calculating EMI:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate EMI',
    });
  }
};

/**
 * Add loan (admin only in a real app)
 */
export const addLoan = async (req: Request, res: Response) => {
  try {
    // In a real app, check if admin
    
    const newLoan = new Loan(req.body);
    await newLoan.save();

    res.status(201).json({
      success: true,
      data: newLoan,
    });
  } catch (error) {
    logger.error('Error adding loan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add loan',
    });
  }
};

/**
 * Update loan (admin only in a real app)
 */
export const updateLoan = async (req: Request, res: Response) => {
  try {
    // In a real app, check if admin
    
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid loan ID',
      });
    }

    const loan = await Loan.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    logger.error('Error updating loan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update loan',
    });
  }
};

/**
 * Delete loan (admin only in a real app)
 */
export const deleteLoan = async (req: Request, res: Response) => {
  try {
    // In a real app, check if admin
    
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid loan ID',
      });
    }

    const loan = await Loan.findByIdAndDelete(id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Loan deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting loan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete loan',
    });
  }
};