import { Request, Response } from 'express';
import User from '../models/User';
import College from '../models/College';
import { logger } from '../utils/logger';
import { getCollegePredictions } from '../utils/ai';

interface CollegePrediction {
  college: any;
  category: 'Safe' | 'Moderate' | 'Ambitious';
  branch?: string;
  probability: number;
  reason: string;
}

/**
 * Generate college predictions based on stream, exam, and rank/percentile
 */
async function generateStreamBasedPredictions({
  stream,
  exam,
  rank,
  percentile,
}: {
  stream: string;
  exam: string;
  rank?: number;
  percentile?: number;
}): Promise<CollegePrediction[]> {
  try {
    // Find colleges matching EXACTLY the stream and exam
    let colleges = await College.find({
      stream: stream,
      exam_accepted: exam
    });

    console.log(`\n📊 DATABASE QUERY RESULTS:`);
    console.log(`Query: { stream: "${stream}", exam_accepted: "${exam}" }`);
    console.log(`Found ${colleges.length} colleges`);
    
    // If no exact match, try case-insensitive search
    if (colleges.length === 0) {
      console.log('❌ No exact match found. Trying case-insensitive search...');
      colleges = await College.find({
        stream: new RegExp(`^${stream}$`, 'i'),
        exam_accepted: new RegExp(`^${exam}$`, 'i')
      });
      console.log(`Case-insensitive search found: ${colleges.length} colleges`);
    }
    
    // If still no match, try partial matching
    if (colleges.length === 0) {
      console.log('❌ No case-insensitive match found. Trying partial matching...');
      colleges = await College.find({
        stream: new RegExp(stream, 'i'),
        exam_accepted: new RegExp(exam, 'i')
      });
      console.log(`Partial matching found: ${colleges.length} colleges`);
    }
    
    if (colleges.length > 0) {
      console.log(`✅ Sample college: ${colleges[0].name} (${colleges[0].stream}, ${colleges[0].exam_accepted})`);
    } else {
      console.log('❌ NO COLLEGES FOUND - This is why you get 0 results!');
      
      // Debug: Check what's actually in the database
      const sampleCollege = await College.findOne();
      if (sampleCollege) {
        console.log(`Database sample: "${sampleCollege.name}" - Stream: "${sampleCollege.stream}", Exam: "${sampleCollege.exam_accepted}"`);
      }
      
      // Show all unique streams and exams in database
      const allStreams = await College.distinct('stream');
      const allExams = await College.distinct('exam_accepted');
      console.log('Available streams in DB:', allStreams);
      console.log('Available exams in DB:', allExams.slice(0, 10), '...');
    }

    const predictions: CollegePrediction[] = [];

    // Determine if this stream uses rank or percentile
    const usesPercentile = ['MEC', 'HEC'].includes(stream);
    const usesRank = ['MPC', 'BiPC', 'CEC'].includes(stream);

    console.log(`\n🔢 PROCESSING ${colleges.length} COLLEGES:`);
    console.log(`Stream type: ${stream} (uses ${usesRank ? 'rank' : 'percentile'})`);
    console.log(`User input: rank=${rank}, percentile=${percentile}`);

    let processedColleges = 0;
    let totalBranches = 0;
    let categorizedPredictions = 0;

    for (const college of colleges) {
      processedColleges++;
      console.log(`\n🏫 Processing college ${processedColleges}: ${college.name}`);
      
      if (college.branches && college.branches.length > 0) {
        console.log(`   Has ${college.branches.length} branches`);
        totalBranches += college.branches.length;
        
        // Handle colleges with branches (mostly engineering/business)
        for (const branch of college.branches) {
          console.log(`   🔹 Branch: ${branch.name} (rank: ${branch.closing_rank_min}-${branch.closing_rank_max})`);
          
          let category: 'Safe' | 'Moderate' | 'Ambitious' | null = null;
          let probability = 0;
          let reason = '';

          if (usesRank && rank) {
            category = categorizeByRank(rank, branch.closing_rank_min, branch.closing_rank_max);
            probability = calculateRankProbability(rank, branch.closing_rank_min, branch.closing_rank_max);
            reason = `Your rank ${rank} vs closing rank ${branch.closing_rank_min}-${branch.closing_rank_max}`;
            console.log(`     Category: ${category}, Probability: ${probability}%`);
          } else if (usesPercentile && percentile && college.closing_percentile) {
            const { category: percentileCategory, probability: percentileProbability } = categorizeByPercentile(percentile, college.closing_percentile);
            category = percentileCategory;
            probability = percentileProbability;
            reason = `Your percentile ${percentile} vs closing percentile ${college.closing_percentile}`;
            console.log(`     Category: ${category}, Probability: ${probability}%`);
          }

          if (category) {
            categorizedPredictions++;
            console.log(`     ✅ Added to ${category} category`);
            predictions.push({
              college,
              branch: branch.name,
              category,
              probability,
              reason,
            });
          } else {
            console.log(`     ❌ Not categorized (too far from rank range)`);
          }
        }
      } else {
        // Handle colleges without branches (medical, law, some humanities)
        let category: 'Safe' | 'Moderate' | 'Ambitious' | null = null;
        let probability = 0;
        let reason = '';

        if (usesRank && rank && college.closing_rank) {
          const [minRank, maxRank] = parseRankRange(college.closing_rank);
          if (minRank && maxRank) {
            category = categorizeByRank(rank, minRank, maxRank);
            probability = calculateRankProbability(rank, minRank, maxRank);
            reason = `Your rank ${rank} vs closing rank ${college.closing_rank}`;
          }
        } else if (usesPercentile && percentile && college.closing_percentile) {
          const { category: percentileCategory, probability: percentileProbability } = categorizeByPercentile(percentile, college.closing_percentile);
          category = percentileCategory;
          probability = percentileProbability;
          reason = `Your percentile ${percentile} vs closing percentile ${college.closing_percentile}`;
        }

        if (category) {
          predictions.push({
            college,
            category,
            probability,
            reason,
          });
        }
      }
    }

    console.log(`\n📈 FINAL RESULTS SUMMARY:`);
    console.log(`Processed ${processedColleges} colleges with ${totalBranches} total branches`);
    console.log(`Generated ${categorizedPredictions} predictions`);
    console.log(`Final predictions array length: ${predictions.length}`);
    
    if (predictions.length > 0) {
      const safeCount = predictions.filter(p => p.category === 'Safe').length;
      const moderateCount = predictions.filter(p => p.category === 'Moderate').length;
      const ambitiousCount = predictions.filter(p => p.category === 'Ambitious').length;
      console.log(`Categories: Safe=${safeCount}, Moderate=${moderateCount}, Ambitious=${ambitiousCount}`);
      console.log(`Sample prediction: ${predictions[0].college.name} - ${predictions[0].branch} (${predictions[0].category})`);
    } else {
      console.log('❌ NO PREDICTIONS GENERATED - This is the problem!');
    }

    // Sort by probability (highest first)
    return predictions.sort((a, b) => b.probability - a.probability);
  } catch (error) {
    logger.error('Error generating stream-based predictions:', error);
    return [];
  }
}

/**
 * Categorize college as Safe, Moderate, or Ambitious based on RANK comparison (for MPC, BiPC, CEC)
 */
function categorizeByRank(userRank: number, minClosingRank: number, maxClosingRank: number): 'Safe' | 'Moderate' | 'Ambitious' | null {
  const avgClosingRank = (minClosingRank + maxClosingRank) / 2;
  
  // Safe: User rank is better (lower) than 80% of the closing rank range
  if (userRank <= avgClosingRank * 0.8) {
    return 'Safe';
  }
  
  // Moderate: User rank is within reasonable range (80%-120% of average)
  if (userRank <= avgClosingRank * 1.2) {
    return 'Moderate';
  }
  
  // Ambitious: User rank is higher but still within 150% of average closing rank
  if (userRank <= avgClosingRank * 1.5) {
    return 'Ambitious';
  }
  
  // Too far from closing ranks
  return null;
}

/**
 * Calculate admission probability based on RANK comparison (for MPC, BiPC, CEC)
 */
function calculateRankProbability(userRank: number, minClosingRank: number, maxClosingRank: number): number {
  const avgClosingRank = (minClosingRank + maxClosingRank) / 2;
  
  if (userRank <= avgClosingRank * 0.5) return 95;
  if (userRank <= avgClosingRank * 0.8) return 85;
  if (userRank <= avgClosingRank) return 70;
  if (userRank <= avgClosingRank * 1.2) return 55;
  if (userRank <= avgClosingRank * 1.5) return 35;
  
  return 20;
}

/**
 * Categorize college as Safe, Moderate, or Ambitious based on PERCENTILE comparison (for MEC, HEC)
 */
function categorizeByPercentile(userPercentile: number, closingPercentileRange: string): { category: 'Safe' | 'Moderate' | 'Ambitious' | null, probability: number } {
  const { min: minPercentile, max: maxPercentile } = parsePercentileRange(closingPercentileRange);
  const avgClosingPercentile = (minPercentile + maxPercentile) / 2;
  
  // For percentiles, higher is better (opposite of ranks)
  // Safe: User percentile is higher than 110% of average closing percentile
  if (userPercentile >= avgClosingPercentile * 1.1) {
    const probability = calculatePercentileProbability(userPercentile, minPercentile, maxPercentile);
    return { category: 'Safe', probability };
  }
  
  // Moderate: User percentile is within 90%-110% of average closing percentile
  if (userPercentile >= avgClosingPercentile * 0.9) {
    const probability = calculatePercentileProbability(userPercentile, minPercentile, maxPercentile);
    return { category: 'Moderate', probability };
  }
  
  // Ambitious: User percentile is within 75%-90% of average closing percentile
  if (userPercentile >= avgClosingPercentile * 0.75) {
    const probability = calculatePercentileProbability(userPercentile, minPercentile, maxPercentile);
    return { category: 'Ambitious', probability };
  }
  
  // Too far from closing percentiles
  return { category: null, probability: 0 };
}

/**
 * Calculate admission probability based on PERCENTILE comparison (for MEC, HEC)
 */
function calculatePercentileProbability(userPercentile: number, minClosingPercentile: number, maxClosingPercentile: number): number {
  const avgClosingPercentile = (minClosingPercentile + maxClosingPercentile) / 2;
  
  // For percentiles, higher is better
  if (userPercentile >= avgClosingPercentile * 1.2) return 95;
  if (userPercentile >= avgClosingPercentile * 1.1) return 85;
  if (userPercentile >= avgClosingPercentile) return 70;
  if (userPercentile >= avgClosingPercentile * 0.9) return 55;
  if (userPercentile >= avgClosingPercentile * 0.75) return 35;
  
  return 20;
}

/**
 * Parse percentile range string like "85-90" or "97–99"
 */
function parsePercentileRange(percentileStr: string): { min: number, max: number } {
  try {
    const match = percentileStr.match(/(\d+)(?:–|-)(\d+)/);
    if (match) {
      return { min: parseInt(match[1]), max: parseInt(match[2]) };
    }
  } catch (error) {
    logger.error('Error parsing percentile range:', error);
  }
  return { min: 80, max: 90 }; // fallback
}

/**
 * Parse rank range string like "1-100" or "150-1,000"
 */
function parseRankRange(rankStr: string): [number, number] | [null, null] {
  try {
    const cleanStr = rankStr.replace(/[^\d-]/g, '');
    const parts = cleanStr.split('-');
    if (parts.length === 2) {
      return [parseInt(parts[0]), parseInt(parts[1])];
    }
  } catch (error) {
    logger.error('Error parsing rank range:', error);
  }
  return [null, null];
}

/**
 * Predict colleges based on stream, exam, and rank/percentile
 */
export const predictColleges = async (req: Request, res: Response) => {
  try {
    const { stream, exam, rank, percentile } = req.body;

    // DEBUG: Log the incoming request
    console.log('\n🔍 COLLEGE PREDICTOR DEBUG:');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log(`Stream: "${stream}", Exam: "${exam}", Rank: ${rank}, Percentile: ${percentile}`);

    // Validate required fields
    if (!stream || !exam) {
      return res.status(400).json({
        success: false,
        message: 'Stream and exam are required',
      });
    }

    // Validate stream
    const validStreams = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC'];
    if (!validStreams.includes(stream)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stream. Must be one of: MPC, BiPC, MEC, CEC, HEC',
      });
    }

    // Validate input based on stream
    const rankBasedStreams = ['MPC', 'BiPC', 'CEC'];
    const percentileBasedStreams = ['MEC', 'HEC'];

    if (rankBasedStreams.includes(stream) && !rank) {
      return res.status(400).json({
        success: false,
        message: `Rank is required for ${stream} stream`,
      });
    }

    if (percentileBasedStreams.includes(stream) && !percentile) {
      return res.status(400).json({
        success: false,
        message: `Percentile is required for ${stream} stream`,
      });
    }

    // Generate predictions using updated algorithm
    const predictions = await generateStreamBasedPredictions({
      stream,
      exam,
      rank: rank ? parseInt(rank) : undefined,
      percentile: percentile ? parseFloat(percentile) : undefined,
    });

    const safe = predictions.filter((p: any) => p.category === 'Safe');
    const moderate = predictions.filter((p: any) => p.category === 'Moderate'); 
    const ambitious = predictions.filter((p: any) => p.category === 'Ambitious');

    // Count unique colleges (not branch-specific predictions)
    const uniqueColleges = new Set(predictions.map((p: any) => p.college._id.toString()));
    const uniqueCollegeCount = uniqueColleges.size;

    console.log(`\n📤 SENDING RESPONSE TO FRONTEND:`);
    console.log(`Safe: ${safe.length} predictions`);
    console.log(`Moderate: ${moderate.length} predictions`);
    console.log(`Ambitious: ${ambitious.length} predictions`);
    console.log(`Total unique colleges: ${uniqueCollegeCount}`);
    console.log(`Response structure will include ${predictions.length} total predictions`);

    const responseData = {
      success: true,
      predictions: {
        safe,
        moderate,
        ambitious,
      },
      categories: {
        safe,
        moderate,
        ambitious,
      },
      summary: {
        totalPredictions: predictions.length,  // Total branch-specific predictions
        totalColleges: uniqueCollegeCount,     // Frontend expects this name
        uniqueColleges: uniqueCollegeCount,    // Actual number of unique colleges
        safeColleges: safe.length,
        moderateColleges: moderate.length,
        ambitiousColleges: ambitious.length,
        safeCount: safe.length,
        moderateCount: moderate.length,
        ambitiousCount: ambitious.length,
        stream,
        exam,
        rank: rank ? parseInt(rank) : null,
        percentile: percentile ? parseFloat(percentile) : null,
        inputType: rankBasedStreams.includes(stream) ? 'rank' : 'percentile',
        explanation: `Found ${uniqueCollegeCount} colleges with ${predictions.length} branch options`,
      },
    };

    console.log(`📦 Response summary: success=${responseData.success}, safe=${responseData.predictions.safe.length}, moderate=${responseData.predictions.moderate.length}, ambitious=${responseData.predictions.ambitious.length}`);

    res.status(200).json(responseData);

  } catch (error) {
    logger.error('Error predicting colleges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to predict colleges',
    });
  }
};

/**
 * Get detailed college information with cutoffs
 */
export const getCollegeDetails = async (req: Request, res: Response) => {
  try {
    const { collegeId } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    // Get relevant cutoffs based on user's category and state
    const relevantCutoffs = getRelevantCutoffs(college, user);
    
    // Calculate admission probability
    const admissionProbability = calculateAdmissionProbability(
      user.entranceScores || [],
      relevantCutoffs,
      user.category || 'General',
      user.state || ''
    );

    res.status(200).json({
      success: true,
      college: {
        ...college.toObject(),
        relevantCutoffs,
        admissionProbability,
        recommendedCourses: getRecommendedCourses(college, user),
      },
    });

  } catch (error) {
    logger.error('Error getting college details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get college details',
    });
  }
};

/**
 * Compare multiple colleges
 */
export const compareColleges = async (req: Request, res: Response) => {
  try {
    const { collegeIds } = req.body;
    const userId = req.userId;

    if (!collegeIds || !Array.isArray(collegeIds) || collegeIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 2 college IDs for comparison',
      });
    }

    if (collegeIds.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 colleges can be compared at once',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const colleges = await College.find({ _id: { $in: collegeIds } });
    
    if (colleges.length !== collegeIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more colleges not found',
      });
    }

    // Generate comparison data
    const comparison = colleges.map(college => {
      const relevantCutoffs = getRelevantCutoffs(college, user);
      const admissionProbability = calculateAdmissionProbability(
        user.entranceScores || [],
        relevantCutoffs,
        user.category || 'General',
        user.state || ''
      );

      return {
        college: {
          id: college._id,
          name: college.name,
          location: college.location,
          type: college.type,
          accreditation: college.accreditation,
        },
        fees: {
          tuition: college.fees?.tuition || 0,
          hostel: college.fees?.hostel || 0,
          total: (college.fees?.tuition || 0) + (college.fees?.hostel || 0),
        },
        placement: {
          averagePackage: college.placements?.averageCTC || 0,
          highestPackage: college.placements?.topCTC || 0,
          placementScore: college.placements?.placementPercentage || 0,
        },
        admissionProbability,
        roi: calculateROI(college),
        pros: generatePros(college, user),
        cons: generateCons(college, user),
      };
    });

    // Generate AI summary
    let aiSummary = '';
    try {
      aiSummary = await generateComparisonSummary(comparison, user);
    } catch (error) {
      logger.warn('AI comparison summary failed:', error);
      aiSummary = 'Compare colleges based on fees, placement, and admission probability.';
    }

    res.status(200).json({
      success: true,
      comparison,
      summary: aiSummary,
      recommendations: generateComparisonRecommendations(comparison),
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
 * Get "What-If" scenarios for different scores
 */
export const getWhatIfScenarios = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { scenarios } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!scenarios || !Array.isArray(scenarios)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide scenarios array',
      });
    }

    const results = [];

    for (const scenario of scenarios) {
      const predictions = await generateCollegePredictions({
        user,
        entranceScores: scenario.entranceScores,
        preferences: user.collegePreferences || {},
      });

      results.push({
        scenario: scenario.name || `Scenario ${results.length + 1}`,
        entranceScores: scenario.entranceScores,
        predictions: {
          ambitious: predictions?.filter((p: any) => p.category === 'Ambitious').slice(0, 3) || [],
          moderate: predictions?.filter((p: any) => p.category === 'Moderate').slice(0, 3) || [],
          safe: predictions?.filter((p: any) => p.category === 'Safe').slice(0, 3) || [],
        },
        summary: {
          totalOptions: predictions?.length || 0,
          bestOption: predictions?.[0] || null,
        },
      });
    }

    res.status(200).json({
      success: true,
      scenarios: results,
      insights: generateScenarioInsights(results),
    });

  } catch (error) {
    logger.error('Error generating what-if scenarios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate scenarios',
    });
  }
};

// Helper functions

const generateCollegePredictions = async (input: {
  user: any;
  entranceScores: any[];
  preferences: any;
}) => {
  const { user, entranceScores, preferences } = input;
  
  try {
    // Try AI predictions first
    let aiUsed = true
    const aiPredictions = await getCollegePredictions({
      entranceScores,
      category: user.category || 'General',
      state: user.state || '',
      preferences,
    });

    if (aiPredictions.length > 0) {
      (aiPredictions as any).aiSource = 'ai'
      return aiPredictions;
    }
  } catch (error) {
    logger.warn('AI predictions failed, using database fallback:', error);
  }

  // Fallback to database-based predictions
  const db = await generateDatabasePredictions(user, entranceScores, preferences);
  (db as any).aiSource = 'fallback'
  return db;
};

const generateDatabasePredictions = async (user: any, entranceScores: any[], preferences: any) => {
  const predictions = [];
  
  // Get colleges from database
  const colleges = await College.find({
    $or: [
      { 'location.state': user.state },
      { type: 'Central' },
    ],
  }).limit(50);

  for (const college of colleges) {
    const relevantCutoffs = getRelevantCutoffs(college, user);
    const probability = calculateAdmissionProbability(
      entranceScores,
      relevantCutoffs,
      user.category || 'General',
      user.state || ''
    );

    if (probability > 0) {
      let category = 'Safe';
      if (probability < 40) category = 'Ambitious';
      else if (probability < 70) category = 'Moderate';

      predictions.push({
        college: college.name,
        course: getBestCourse(college, entranceScores),
        category,
        probability,
        fees: college.fees?.tuition || 0,
        placement: college.placements?.averageCTC || 0,
        collegeId: college._id,
      });
    }
  }

  return predictions.sort((a, b) => b.probability - a.probability);
};

const getRelevantCutoffs = (college: any, user: any) => {
  if (!college.cutoffs) return [];

  return college.cutoffs.filter((cutoff: any) => {
    // Filter by category
    if (cutoff.category && cutoff.category !== user.category) return false;
    
    // Filter by state (for state quota)
    if (cutoff.quota === 'State' && cutoff.state !== user.state) return false;
    
    return true;
  });
};

const calculateAdmissionProbability = (
  entranceScores: any[],
  cutoffs: any[],
  category: string,
  state: string
): number => {
  if (!entranceScores.length || !cutoffs.length) return 0;

  let maxProbability = 0;

  for (const score of entranceScores) {
    for (const cutoff of cutoffs) {
      if (cutoff.examName === score.examName) {
        let probability = 0;
        
        if (score.rank && cutoff.closingRank) {
          probability = Math.max(0, 100 - ((score.rank / cutoff.closingRank) * 100));
        } else if (score.percentile && cutoff.percentile) {
          probability = Math.max(0, (score.percentile / cutoff.percentile) * 100);
        } else if (score.score && cutoff.cutoffScore) {
          probability = Math.max(0, (score.score / cutoff.cutoffScore) * 100);
        }

        // Adjust for category benefits
        if (category !== 'General') {
          probability *= 1.1; // 10% boost for reserved categories
        }

        // Adjust for home state advantage
        if (cutoff.quota === 'State' && cutoff.state === state) {
          probability *= 1.15; // 15% boost for home state
        }

        maxProbability = Math.max(maxProbability, Math.min(probability, 95));
      }
    }
  }

  return Math.round(maxProbability);
};

const getRecommendedCourses = (college: any, user: any) => {
  const courses = college.courses || [];
  const userInterests = user.interests || [];
  const userStream = user.class12Details?.stream;

  return courses
    .filter((course: any) => {
      // Filter by stream compatibility
      if (userStream === 'Science' && !['Engineering', 'Medical', 'Science'].includes(course.category)) {
        return false;
      }
      if (userStream === 'Commerce' && !['Commerce', 'Management', 'Economics'].includes(course.category)) {
        return false;
      }
      return true;
    })
    .sort((a: any, b: any) => {
      // Sort by interest match
      const aMatch = userInterests.some((interest: string) => 
        a.name.toLowerCase().includes(interest.toLowerCase())
      );
      const bMatch = userInterests.some((interest: string) => 
        b.name.toLowerCase().includes(interest.toLowerCase())
      );
      
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    })
    .slice(0, 5);
};

const getBestCourse = (college: any, entranceScores: any[]) => {
  const courses = college.courses || [];
  if (courses.length === 0) return 'General';

  // Simple logic: return most popular course for the exam type
  const examNames = entranceScores.map(s => s.examName);
  
  if (examNames.includes('JEE Main') || examNames.includes('JEE Advanced')) {
    return courses.find((c: any) => c.category === 'Engineering')?.name || courses[0]?.name;
  }
  if (examNames.includes('NEET')) {
    return courses.find((c: any) => c.category === 'Medical')?.name || courses[0]?.name;
  }
  
  return courses[0]?.name || 'General';
};

const calculateROI = (college: any): number => {
  const fees = (college.fees?.tuition || 0) * 4; // 4 years
  const avgPackage = college.placement?.averagePackage || 0;
  
  if (fees === 0) return 0;
  return Math.round((avgPackage / fees) * 100);
};

const generatePros = (college: any, user: any): string[] => {
  const pros = [];
  
  if (college.accreditation?.naac === 'A++') pros.push('NAAC A++ accredited');
  if (college.placement?.placementRate > 80) pros.push('High placement rate');
  if (college.fees?.tuition < 200000) pros.push('Affordable fees');
  if (college.location?.state === user.state) pros.push('Home state advantage');
  if (college.type === 'Government') pros.push('Government institution');
  
  return pros.slice(0, 3);
};

const generateCons = (college: any, user: any): string[] => {
  const cons = [];
  
  if (college.fees?.tuition > 500000) cons.push('High fees');
  if (college.placement?.placementRate < 60) cons.push('Lower placement rate');
  if (college.location?.state !== user.state) cons.push('Out of state');
  if (!college.accreditation?.naac) cons.push('No NAAC accreditation');
  
  return cons.slice(0, 3);
};

const analyzeEntranceScores = (entranceScores: any[]) => {
  const analysis: any = {
    totalExams: entranceScores.length,
    bestPerformance: null,
    examTypes: [],
  };

  let bestScore = 0;
  for (const score of entranceScores) {
    analysis.examTypes.push(score.examName);
    
    const normalizedScore = score.percentile || (score.rank ? 100 - (score.rank / 10000) : 0);
    if (normalizedScore > bestScore) {
      bestScore = normalizedScore;
      analysis.bestPerformance = score;
    }
  }

  return analysis;
};

const generateComparisonSummary = async (comparison: any[], user: any): Promise<string> => {
  // This would use AI to generate a summary
  // For now, return a simple summary
  const bestROI = comparison.reduce((best, current) => 
    current.roi > best.roi ? current : best
  );
  
  const mostAffordable = comparison.reduce((best, current) => 
    current.fees.total < best.fees.total ? current : best
  );

  return `${bestROI.college.name} offers the best ROI (${bestROI.roi}%), while ${mostAffordable.college.name} is the most affordable option.`;
};

const generateComparisonRecommendations = (comparison: any[]) => {
  return [
    {
      type: 'Best ROI',
      college: comparison.reduce((best, current) => 
        current.roi > best.roi ? current : best
      ).college,
    },
    {
      type: 'Most Affordable',
      college: comparison.reduce((best, current) => 
        current.fees.total < best.fees.total ? current : best
      ).college,
    },
    {
      type: 'Highest Probability',
      college: comparison.reduce((best, current) => 
        current.admissionProbability > best.admissionProbability ? current : best
      ).college,
    },
  ];
};

const generateScenarioInsights = (scenarios: any[]) => {
  const insights = [];
  
  if (scenarios.length >= 2) {
    const improvement = scenarios[1].predictions.ambitious.length - scenarios[0].predictions.ambitious.length;
    if (improvement > 0) {
      insights.push(`Improving your score could open ${improvement} more ambitious college options`);
    }
  }

  return insights;
};
