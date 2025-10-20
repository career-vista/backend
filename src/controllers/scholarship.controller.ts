import { Request, Response } from 'express';
import Scholarship from '../models/Scholarship';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Get all scholarships with comprehensive filtering and user profile matching
 */
export const getScholarships = async (req: Request, res: Response) => {
  try {
    const {
      // Filter parameters
      search,
      type,
      sector,
      minAmount,
      maxAmount,
      // User profile for eligibility calculation
      userProfile,
      // Pagination
      limit = 50,
      page = 1,
      sort = 'amount',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    const query: any = {};

    // Search filter (name, description, provider) - using regex for better partial matching
    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { provider: searchRegex }
      ];
    }

    // Type filter
    if (type && type !== 'All') {
      query.type = type;
    }

    // Sector filter
    if (sector && sector !== 'All') {
      query.sector = sector;
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    // Get total count for pagination
    const total = await Scholarship.countDocuments(query);

    // Build sort object
    const sortObj: any = {};
    if (sort === 'amount') {
      sortObj.amount = sortOrder === 'asc' ? 1 : -1;
    } else if (sort === 'deadline') {
      sortObj.applicationDeadline = sortOrder === 'asc' ? 1 : -1;
    } else if (sort === 'name') {
      sortObj.name = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObj.amount = -1; // Default sort by amount descending
    }

    // Execute query with pagination and sorting
    let scholarships = await Scholarship.find(query)
      .sort(sortObj)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    // Calculate eligibility and match scores if user profile is provided
    if (userProfile && typeof userProfile === 'string') {
      try {
        const profile = JSON.parse(userProfile);
        scholarships = scholarships.map((scholarship: any) => {
          const eligibilityResult = calculateEligibility(scholarship, profile);
          return {
            ...scholarship,
            matchScore: eligibilityResult.matchScore,
            eligibilityStatus: eligibilityResult.eligibilityStatus,
          } as any;
        });

        // Re-sort by match score if user profile is provided
        scholarships.sort((a: any, b: any) => {
          const scoreDiff = (b.matchScore || 0) - (a.matchScore || 0);
          if (scoreDiff !== 0) return scoreDiff;
          return b.amount - a.amount;
        });
      } catch (error) {
        logger.warn('Failed to parse user profile:', error);
      }
    }

    // Calculate statistics
    const stats = {
      total,
      eligible: userProfile ? scholarships.filter((s: any) => s.eligibilityStatus === 'Eligible').length : 0,
      totalFunding: scholarships.reduce((sum: number, s: any) => sum + s.amount, 0),
      avgAmount: scholarships.length > 0 ? Math.round(scholarships.reduce((sum: number, s: any) => sum + s.amount, 0) / scholarships.length) : 0,
    };

    res.status(200).json({
      success: true,
      count: scholarships.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      stats,
      data: scholarships,
    });
  } catch (error) {
    logger.error('Error getting scholarships:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scholarships',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
};

/**
 * Calculate eligibility and match score for a scholarship based on user profile
 */
function calculateEligibility(scholarship: any, userProfile: any) {
  let score = 0;
  let eligible = true;

  // Check percentage requirement (30 points)
  if (userProfile.percentage >= scholarship.eligibility.minPercentage) {
    score += 30;
  } else {
    eligible = false;
  }

  // Check category eligibility (25 points)
  if (
    scholarship.eligibility.categories.includes(userProfile.category) ||
    scholarship.eligibility.categories.includes('All') ||
    scholarship.eligibility.categories.includes('General')
  ) {
    score += 25;
  } else {
    eligible = false;
  }

  // Check income limit (20 points)
  if (scholarship.eligibility.incomeLimit) {
    if (userProfile.familyIncome <= scholarship.eligibility.incomeLimit) {
      score += 20;
    } else {
      eligible = false;
    }
  } else {
    score += 20; // No income limit specified
  }

  // Check course eligibility (15 points)
  if (
    scholarship.eligibility.courses.includes(userProfile.course) ||
    scholarship.eligibility.courses.includes('All')
  ) {
    score += 15;
  } else {
    eligible = false;
  }

  // Check gender requirement (5 points)
  if (scholarship.eligibility.gender) {
    if (userProfile.gender === scholarship.eligibility.gender) {
      score += 5;
    } else {
      eligible = false;
    }
  } else {
    score += 5; // No gender restriction
  }

  // Check PWD requirement (5 points)
  if (scholarship.eligibility.pwd !== undefined) {
    if (userProfile.pwd === scholarship.eligibility.pwd) {
      score += 5;
    } else {
      eligible = false;
    }
  } else {
    score += 5; // No PWD restriction
  }

  // Determine eligibility status
  let eligibilityStatus: 'Eligible' | 'Not Eligible' | 'Partially Eligible';
  if (eligible) {
    eligibilityStatus = 'Eligible';
  } else if (score >= 50) {
    eligibilityStatus = 'Partially Eligible';
  } else {
    eligibilityStatus = 'Not Eligible';
  }

  return { matchScore: score, eligibilityStatus };
}

/**
 * Get scholarship by ID
 */
export const getScholarshipById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userProfile } = req.query;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scholarship ID',
      });
    }

    let scholarship = await Scholarship.findById(id).lean();

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found',
      });
    }

    // Calculate eligibility if user profile is provided
    if (userProfile && typeof userProfile === 'string') {
      try {
        const profile = JSON.parse(userProfile);
        const eligibilityResult = calculateEligibility(scholarship, profile);
        scholarship = {
          ...scholarship,
          matchScore: eligibilityResult.matchScore,
          eligibilityStatus: eligibilityResult.eligibilityStatus,
        } as any;
      } catch (error) {
        logger.warn('Failed to parse user profile:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    logger.error('Error getting scholarship by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scholarship',
    });
  }
};

/**
 * Get scholarships by eligibility criteria - Simplified version that uses the main getScholarships with eligibilityOnly filter
 */
export const getEligibleScholarships = async (req: Request, res: Response) => {
  try {
    const { userProfile, limit = 20, page = 1 } = req.body;

    if (!userProfile) {
      return res.status(400).json({
        success: false,
        message: 'User profile is required',
      });
    }

    // Use the main getScholarships function with user profile
    req.query = {
      ...req.query,
      userProfile: JSON.stringify(userProfile),
      limit: limit.toString(),
      page: page.toString(),
      sort: 'matchScore',
      sortOrder: 'desc',
    };

    return getScholarships(req, res);
  } catch (error) {
    logger.error('Error getting eligible scholarships:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get eligible scholarships',
    });
  }
};

/**
 * Add scholarship (admin only in a real app)
 */
export const addScholarship = async (req: Request, res: Response) => {
  try {
    // In a real app, check if user is admin
    
    const scholarshipData = req.body;
    
    // Auto-detect sector based on provider if not provided
    if (!scholarshipData.sector) {
      scholarshipData.sector = detectSector(scholarshipData.provider, scholarshipData.type);
    }

    const newScholarship = new Scholarship(scholarshipData);
    await newScholarship.save();

    res.status(201).json({
      success: true,
      message: 'Scholarship added successfully',
      data: newScholarship,
    });
  } catch (error) {
    logger.error('Error adding scholarship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add scholarship',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
};

/**
 * Bulk add scholarships
 */
export const bulkAddScholarships = async (req: Request, res: Response) => {
  try {
    const { scholarships } = req.body;

    if (!Array.isArray(scholarships) || scholarships.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Scholarships array is required',
      });
    }

    // Auto-detect sector for each scholarship if not provided
    const processedScholarships = scholarships.map((scholarship: any) => ({
      ...scholarship,
      sector: scholarship.sector || detectSector(scholarship.provider, scholarship.type),
    }));

    const result = await Scholarship.insertMany(processedScholarships, { ordered: false });

    res.status(201).json({
      success: true,
      message: `${result.length} scholarships added successfully`,
      count: result.length,
      data: result,
    });
  } catch (error) {
    logger.error('Error bulk adding scholarships:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk add scholarships',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
};

/**
 * Auto-detect sector based on provider and type
 */
function detectSector(provider: string, type: string): 'Government' | 'Corporate' | 'Private' {
  const providerLower = provider.toLowerCase();
  
  // Government indicators
  if (
    type === 'Central' ||
    type === 'State' ||
    providerLower.includes('government') ||
    providerLower.includes('ministry') ||
    providerLower.includes('department') ||
    providerLower.includes('ugc') ||
    providerLower.includes('aicte') ||
    providerLower.includes('csir') ||
    providerLower.includes('icmr') ||
    providerLower.includes('dst')
  ) {
    return 'Government';
  }

  // Corporate indicators
  if (
    providerLower.includes('foundation') ||
    providerLower.includes('limited') ||
    providerLower.includes('ltd') ||
    providerLower.includes('corporation') ||
    providerLower.includes('company') ||
    providerLower.includes('reliance') ||
    providerLower.includes('tata') ||
    providerLower.includes('infosys') ||
    providerLower.includes('wipro')
  ) {
    return 'Corporate';
  }

  // Default to Private (NGOs, trusts, universities, etc.)
  return 'Private';
}

/**
 * Update scholarship (admin only in a real app)
 */
export const updateScholarship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scholarship ID',
      });
    }

    const scholarship = await Scholarship.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Scholarship updated successfully',
      data: scholarship,
    });
  } catch (error) {
    logger.error('Error updating scholarship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scholarship',
    });
  }
};

/**
 * Delete scholarship (admin only in a real app)
 */
export const deleteScholarship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scholarship ID',
      });
    }

    const scholarship = await Scholarship.findByIdAndDelete(id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Scholarship deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting scholarship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete scholarship',
    });
  }
};

/**
 * Get scholarship statistics
 */
export const getScholarshipStats = async (req: Request, res: Response) => {
  try {
    const { userProfile } = req.query;

    // Basic statistics
    const totalCount = await Scholarship.countDocuments();
    const totalFunding = await Scholarship.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Statistics by type
    const typeStats = await Scholarship.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
      { $sort: { count: -1 } }
    ]);

    // Statistics by sector
    const sectorStats = await Scholarship.aggregate([
      { $group: { _id: '$sector', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
      { $sort: { count: -1 } }
    ]);

    const stats: any = {
      total: totalCount,
      totalFunding: totalFunding[0]?.total || 0,
      averageAmount: totalCount > 0 ? Math.round((totalFunding[0]?.total || 0) / totalCount) : 0,
      byType: typeStats,
      bySector: sectorStats,
    };

    // If user profile is provided, calculate personalized stats
    if (userProfile && typeof userProfile === 'string') {
      try {
        const profile = JSON.parse(userProfile);
        const allScholarships = await Scholarship.find({}).lean();
        
        let eligibleCount = 0;
        let partiallyEligibleCount = 0;
        let eligibleFunding = 0;

        allScholarships.forEach((scholarship: any) => {
          const eligibilityResult = calculateEligibility(scholarship, profile);
          if (eligibilityResult.eligibilityStatus === 'Eligible') {
            eligibleCount++;
            eligibleFunding += scholarship.amount;
          } else if (eligibilityResult.eligibilityStatus === 'Partially Eligible') {
            partiallyEligibleCount++;
          }
        });

        stats.personalizedStats = {
          eligible: eligibleCount,
          partiallyEligible: partiallyEligibleCount,
          eligibleFunding,
          eligibilityRate: totalCount > 0 ? Math.round((eligibleCount / totalCount) * 100) : 0,
        };
      } catch (error) {
        logger.warn('Failed to calculate personalized stats:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting scholarship statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scholarship statistics',
    });
  }
};