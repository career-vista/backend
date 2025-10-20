import { Request, Response } from 'express';
import User from '../models/User';
import { logger } from '../utils/logger';

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    // Get fields to update
    const {
      name,
      phone,
      class: userClass,
      board,
      state,
      category,
      interests,
      examCompleted,
      examDate,
    } = req.body;
    
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (userClass !== undefined) updateData.class = userClass;
    if (board !== undefined) updateData.board = board;
    if (state !== undefined) updateData.state = state;
    if (category !== undefined) updateData.category = category;
    if (interests !== undefined) updateData.interests = interests;
    if (examCompleted !== undefined) updateData.examCompleted = examCompleted;
    if (examDate !== undefined) updateData.examDate = examDate;
    
    // Check if profile is being completed
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // If essential fields are provided and profile was not completed before,
    // mark profile as completed
    if (
      !user.profileCompleted &&
      userClass !== undefined &&
      board !== undefined &&
      state !== undefined
    ) {
      updateData.profileCompleted = true;
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

/**
 * Get user test scores
 */
export const getTestScores = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      testScores: user.testScores || {},
    });
  } catch (error) {
    logger.error('Error getting test scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get test scores',
    });
  }
};

/**
 * Save academic test (Class 10) results and selected stream
 */
export const saveTestAndPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { fundamentalsTest10, selectedStream, interests } = req.body;

    const update: any = {};
    if (fundamentalsTest10) update.fundamentalsTest10 = fundamentalsTest10;
    if (selectedStream) update.selectedStream = selectedStream;
    if (interests) update.interests = interests;

    const updated = await User.findByIdAndUpdate(userId, { $set: update }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user: updated });
  } catch (error) {
    logger.error('Error saving test/preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to save data' });
  }
};

/**
 * Get user recommended streams
 */
export const getRecommendedStreams = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      recommendedStreams: [], // Stream recommendations no longer stored in database
    });
  } catch (error) {
    logger.error('Error getting recommended streams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommended streams',
    });
  }
};

/**
 * Get consolidated profile summary (interests, academics, test, selected stream)
 */
export const getProfileSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      summary: {
        name: user.name,
        email: user.email,
        class: user.class,
        board: user.board,
        state: user.state,
        category: user.category,
        gender: user.gender,
        interests: user.interests || [],
        // class10Marks and class12Details removed from model
        entranceScores: user.entranceScores || [],
        testScores: user.testScores || {},
        // fundamentalsTest10 removed - using testScores.fundamentals instead
        selectedStream: (user as any).selectedStream || null,
        recommendedStreams: [], // Stream recommendations no longer stored in database
        lastCollegePredictionSummary: (user as any).lastCollegePredictionSummary || null,
      },
    });
  } catch (error) {
    logger.error('Error fetching profile summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile summary' });
  }
};