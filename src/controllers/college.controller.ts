import { Request, Response } from 'express';
import College from '../models/College';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

type PredictorInput = {
  exam: 'JEE' | 'NEET' | 'EAMCET'
  score: number
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS'
  homeState?: string
}

// 2025 baseline cutoffs for general category, used if college lacks specific entries
const BASELINES = {
  JEE_percentile: 93, // ~93%ile general
  NEET_marks: 600, // 590-610
  EAMCET_rank: 5000, // ~5K for JNTU Hyderabad
}

function computeFit(exam: PredictorInput['exam'], score: number, cutoff: number, category?: string, isHomeState?: boolean): number {
  // Lower-is-better for ranks
  if (exam === 'EAMCET') {
    const ratio = cutoff / Math.max(score, 1)
    let fit = Math.min(100, Math.max(0, 100 * Math.pow(ratio, 0.5)))
    if (category && category !== 'General') fit += 5
    if (isHomeState) fit += 7
    return Math.max(0, Math.min(100, fit))
  }
  // Higher-is-better for percentile/marks
  const ratio = score / Math.max(cutoff, 1)
  let fit = Math.min(100, Math.max(0, 60 * ratio + 40 * Math.tanh(ratio - 1)))
  if (category && category !== 'General') fit += 5
  if (isHomeState) fit += 7
  return Math.max(0, Math.min(100, fit))
}

function readCutoff(college: any, exam: PredictorInput['exam']): number | null {
  const map: Record<string, string> = {
    JEE: 'JEE_percentile',
    NEET: 'NEET_marks',
    EAMCET: 'EAMCET_rank',
  }
  const key = map[exam]
  const value = (college.cutoffs && (college.cutoffs as any).get?.(key)) || (college.cutoffs?.[key])
  if (typeof value === 'number') return value
  return null
}

export const predictColleges = async (req: Request, res: Response) => {
  try {
    const { exam, score, category, homeState } = req.body as PredictorInput

    // fetch candidate colleges for exam
    let streamFilter: any = {}
    if (exam === 'JEE' || exam === 'EAMCET') streamFilter = { streams: 'Engineering' }
    if (exam === 'NEET') streamFilter = { streams: 'Medical' }

    const colleges = await College.find(streamFilter).limit(1000)

    const scored = colleges.map((c: any) => {
      const co = readCutoff(c, exam) ?? (BASELINES as any)[
        exam === 'JEE' ? 'JEE_percentile' : exam === 'NEET' ? 'NEET_marks' : 'EAMCET_rank'
      ]
      const isHome = homeState && c.state && String(c.state).toLowerCase() === String(homeState).toLowerCase()
      const fit = computeFit(exam, score, co, category, !!isHome)
      return { college: c, fit }
    })

    // rank and slice buckets
    const sorted = scored.sort((a, b) => b.fit - a.fit)
    const ambitious = sorted.slice(0, 10)
    const moderate = sorted.slice(10, 25)
    const safe = sorted.slice(25, 45)

    const toDto = (x: typeof ambitious) =>
      x.map(({ college, fit }) => ({
        id: college._id,
        name: college.name,
        state: college.state,
        city: college.city,
        type: college.type,
        fees: college.fees,
        placements: college.placements,
        accreditation: college.accreditation,
        website: college.website,
        fit: Math.round(fit),
      }))

    res.status(200).json({
      success: true,
      data: {
        exam,
        inputScore: score,
        category: category || 'General',
        homeState: homeState || null,
        ambitious: toDto(ambitious),
        moderate: toDto(moderate),
        safe: toDto(safe),
      },
    })
  } catch (error) {
    logger.error('Error predicting colleges:', error)
    res.status(500).json({ success: false, message: 'Failed to predict colleges' })
  }
}

/**
 * Get all colleges with filtering
 */
export const getColleges = async (req: Request, res: Response) => {
  try {
    const {
      stream,
      state,
      city,
      type,
      fees,
      limit = 20,
      page = 1,
      sort = 'name',
    } = req.query;

    // Build query
    const query: any = {};

    if (stream) query.streams = stream;
    if (state) query['location.state'] = state;
    if (city) query['location.city'] = city;
    if (type) query.type = type;
    if (fees) {
      const [min, max] = (fees as string).split('-');
      query['fees.annual'] = { $gte: parseInt(min), $lte: parseInt(max) };
    }

    // Count total documents for pagination
    const total = await College.countDocuments(query);

    // Execute query with pagination and sorting
    const colleges = await College.find(query)
      .sort({ [sort as string]: sort === 'fees.annual' ? 1 : 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      success: true,
      count: colleges.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: colleges,
    });
  } catch (error) {
    logger.error('Error getting colleges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get colleges',
    });
  }
};

/**
 * Get college by ID
 */
export const getCollegeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid college ID',
      });
    }

    const college = await College.findById(id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error) {
    logger.error('Error getting college by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get college',
    });
  }
};

/**
 * Get colleges by stream
 */
export const getCollegesByStream = async (req: Request, res: Response) => {
  try {
    const { stream } = req.params;
    const { limit = 20, page = 1 } = req.query;

    // Validate stream
    if (![
      'Science',
      'Commerce',
      'Arts',
      'Engineering',
      'Medical',
      'Law',
      'Management',
    ].includes(stream)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stream',
      });
    }

    // Count total documents for pagination
    const total = await College.countDocuments({ streams: stream });

    // Execute query with pagination
    const colleges = await College.find({ streams: stream })
      .sort({ name: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      success: true,
      count: colleges.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: colleges,
    });
  } catch (error) {
    logger.error('Error getting colleges by stream:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get colleges',
    });
  }
};

/**
 * Get colleges by location
 */
export const getCollegesByLocation = async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const { city, limit = 20, page = 1 } = req.query;

    // Build query
    const query: any = { 'location.state': state };
    if (city) query['location.city'] = city;

    // Count total documents for pagination
    const total = await College.countDocuments(query);

    // Execute query with pagination
    const colleges = await College.find(query)
      .sort({ name: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      success: true,
      count: colleges.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: colleges,
    });
  } catch (error) {
    logger.error('Error getting colleges by location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get colleges',
    });
  }
};

/**
 * Compare colleges
 */
export const compareColleges = async (req: Request, res: Response) => {
  try {
    const { collegeIds } = req.body;

    // Validate ObjectIds
    for (const id of collegeIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid college ID: ${id}`,
        });
      }
    }

    // Get colleges
    const colleges = await College.find({ _id: { $in: collegeIds } });

    // Check if all colleges were found
    if (colleges.length !== collegeIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more colleges not found',
      });
    }

    // Prepare comparison data
    const comparisonData = colleges.map(college => ({
      id: college._id,
      name: college.name,
      location: college.location,
      type: college.type,
      streams: college.streams,
      courses: college.courses,
      fees: college.fees,
      facilities: college.facilities,
      placements: college.placements,
      website: college.website,
    }));

    res.status(200).json({
      success: true,
      data: comparisonData,
    });
  } catch (error) {
    logger.error('Error comparing colleges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare colleges',
    });
  }
};

/**
 * Add college (admin only in a real app)
 */
export const addCollege = async (req: Request, res: Response) => {
  try {
    // In a real app, check if admin
    
    const newCollege = new College(req.body);
    await newCollege.save();

    res.status(201).json({
      success: true,
      data: newCollege,
    });
  } catch (error) {
    logger.error('Error adding college:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add college',
    });
  }
};

/**
 * Update college (admin only in a real app)
 */
export const updateCollege = async (req: Request, res: Response) => {
  try {
    // In a real app, check if admin
    
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid college ID',
      });
    }

    const college = await College.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error) {
    logger.error('Error updating college:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update college',
    });
  }
};

/**
 * Delete college (admin only in a real app)
 */
export const deleteCollege = async (req: Request, res: Response) => {
  try {
    // In a real app, check if admin
    
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid college ID',
      });
    }

    const college = await College.findByIdAndDelete(id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'College deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting college:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete college',
    });
  }
};