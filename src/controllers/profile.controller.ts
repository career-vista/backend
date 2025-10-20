import { Request, Response } from 'express';
import User from '../models/User';
import { logger } from '../utils/logger';
import { generateAIInterests } from '../utils/ai';

/**
 * Complete user profile setup with enhanced data collection
 */
export const completeProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const {
      name,
      phone,
      class: userClass,
      board,
      state,
      category,
      gender,
      income,
      class10Marks,
      class12Details,
      entranceScores,
      interests,
    } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Note: AI interest generation removed as field no longer exists

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          phone,
          class: userClass,
          board,
          state,
          category,
          gender,
          income,
          interests: interests || [],
          class10Marks,
          class12Details,
          entranceScores: entranceScores || [],
          profileCompleted: true,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: updatedUser?._id,
        email: updatedUser?.email,
        name: updatedUser?.name,
        profileCompleted: updatedUser?.profileCompleted,
        class: updatedUser?.class,
        board: updatedUser?.board,
        state: updatedUser?.state,
        category: updatedUser?.category,
        gender: updatedUser?.gender,
        interests: updatedUser?.interests,
        // class10Marks and class12Details removed from model
        entranceScores: updatedUser?.entranceScores,
      },
    });
  } catch (error) {
    logger.error('Error completing profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete profile',
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.email;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

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
 * Get AI-generated interest suggestions
 */
export const getInterestSuggestions = async (req: Request, res: Response) => {
  try {
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        message: 'Responses array is required',
      });
    }

    // Generate interest suggestions based on user responses
    const suggestions = await generateAIInterests({
      responses,
      quick: true,
    });

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    logger.error('Error generating interest suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate interest suggestions',
    });
  }
};

/**
 * Sync offline data
 */
export const syncOfflineData = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { offlineData, lastModified } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if server data is newer
    const serverLastModified = user.updatedAt;
    const clientLastModified = new Date(lastModified);

    let syncResult = 'no_conflict';
    let finalData = offlineData;

    if (serverLastModified > clientLastModified) {
      // Server has newer data, return server data for client to merge
      syncResult = 'server_newer';
      finalData = user.toObject();
    } else {
      // Client data is newer or same, update server
      await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            ...offlineData,
          },
        },
        { runValidators: true }
      );
      syncResult = 'client_updated';
    }

    res.status(200).json({
      success: true,
      syncResult,
      data: finalData,
      serverTimestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error syncing offline data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync offline data',
    });
  }
};

/**
 * Get profile completion status
 */
export const getProfileStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate completion percentage
    const requiredFields = [
      'name',
      'class',
      'board',
      'state',
      'category',
      'gender',
    ];

    const optionalFields = [
      'phone',
      'income',
      'interests',
      'class10Marks',
      'class12Details',
    ];

    let completedRequired = 0;
    let completedOptional = 0;

    requiredFields.forEach(field => {
      if (user[field as keyof typeof user]) {
        completedRequired++;
      }
    });

    optionalFields.forEach(field => {
      if (user[field as keyof typeof user]) {
        completedOptional++;
      }
    });

    const completionPercentage = Math.round(
      ((completedRequired / requiredFields.length) * 70) +
      ((completedOptional / optionalFields.length) * 30)
    );

    const missingRequired = requiredFields.filter(
      field => !user[field as keyof typeof user]
    );

    const missingOptional = optionalFields.filter(
      field => !user[field as keyof typeof user]
    );

    res.status(200).json({
      success: true,
      profileCompleted: user.profileCompleted,
      completionPercentage,
      missingRequired,
      missingOptional,
      canTakeTest: completedRequired === requiredFields.length,
    });
  } catch (error) {
    logger.error('Error getting profile status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile status',
    });
  }
};
