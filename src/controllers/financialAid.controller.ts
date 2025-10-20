import { Request, Response } from 'express';
import User from '../models/User';
import Scholarship from '../models/Scholarship';
import Loan from '../models/Loan';
import College from '../models/College';
import { logger } from '../utils/logger';

/**
 * Get personalized financial aid recommendations
 */
export const getFinancialAidRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get matching scholarships
    const scholarships = await getMatchingScholarships(user);
    
    // Get suitable education loans
    const loans = await getSuitableLoans(user);

    // Calculate total aid potential
    const totalScholarshipAmount = scholarships.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
    const maxLoanAmount = Math.max(...loans.map((l: any) => l.amount || 0), 0);

    res.status(200).json({
      success: true,
      financialAid: {
        scholarships: scholarships.slice(0, 8),
        loans: loans.slice(0, 5),
        summary: {
          totalScholarships: scholarships.length,
          totalScholarshipAmount,
          maxLoanAmount,
          estimatedTotalAid: totalScholarshipAmount + maxLoanAmount,
        },
      },
    });

  } catch (error) {
    logger.error('Error getting financial aid recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get financial aid recommendations',
    });
  }
};

/**
 * Calculate EMI for education loans
 */
export const calculateLoanEMI = async (req: Request, res: Response) => {
  try {
    const { loanAmount, interestRate, tenure, loanType } = req.body;

    if (!loanAmount || !interestRate || !tenure) {
      return res.status(400).json({
        success: false,
        message: 'Loan amount, interest rate, and tenure are required',
      });
    }

    const monthlyRate = interestRate / (12 * 100);
    const tenureMonths = tenure * 12;
    
    // EMI calculation using standard formula
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const totalAmount = emi * tenureMonths;
    const totalInterest = totalAmount - loanAmount;

    // Get loan details if loanType is provided
    let loanDetails = null;
    if (loanType) {
      loanDetails = await Loan.findOne({ name: new RegExp(loanType, 'i') });
    }

    res.status(200).json({
      success: true,
      calculation: {
        loanAmount,
        interestRate,
        tenure,
        emi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest),
        monthlyIncome: Math.round(emi * 3), // Recommended monthly income (3x EMI)
      },
      loanDetails,
    });

  } catch (error) {
    logger.error('Error calculating loan EMI:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate EMI',
    });
  }
};

/**
 * Get detailed scholarship information
 */
export const getScholarshipDetails = async (req: Request, res: Response) => {
  try {
    const { scholarshipId } = req.params;
    const userId = req.userId;

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check eligibility
    const eligibility = checkScholarshipEligibility(scholarship, user);

    // Get application timeline
    const timeline = getApplicationTimeline(scholarship);

    res.status(200).json({
      success: true,
      scholarship: {
        ...scholarship.toObject(),
        eligibility,
        timeline,
        applicationSteps: getApplicationSteps(scholarship),
        requiredDocuments: getRequiredDocuments(scholarship),
      },
    });

  } catch (error) {
    logger.error('Error getting scholarship details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scholarship details',
    });
  }
};

/**
 * Generate comprehensive financial aid report
 */
export const generateFinancialReport = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { collegeIds, coursePreferences } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!collegeIds || !Array.isArray(collegeIds)) {
      return res.status(400).json({
        success: false,
        message: 'College IDs array is required',
      });
    }

    const colleges = await College.find({ _id: { $in: collegeIds } });
    const scholarships = await getMatchingScholarships(user);
    const loans = await getSuitableLoans(user);

    const report: any = {
      colleges: [],
      scholarships: scholarships.slice(0, 5),
      loans: loans.slice(0, 3),
      summary: {
        totalEstimatedCost: 0,
        totalScholarshipPotential: 0,
        netCostAfterAid: 0,
        recommendedLoanAmount: 0,
      },
    };

    // Calculate costs for each college
    for (const college of colleges) {
      const tuitionFees = college.fees?.tuition || 0;
      const hostelFees = college.fees?.hostel || 0;
      const otherFees = college.fees?.other || 0;
      const totalFees = (tuitionFees + hostelFees + otherFees) * 4; // 4 years

      // Calculate applicable scholarships for this college
      const applicableScholarships = scholarships.filter(s => 
        isScholarshipApplicableToCollege(s, college)
      );

      const scholarshipAmount = applicableScholarships.reduce((sum: number, s: any) => 
        sum + (typeof s.amount === 'number' ? s.amount : s.amount?.min || 0), 0
      );

      const netCost = Math.max(0, totalFees - scholarshipAmount);

      report.colleges.push({
        college: {
          id: college._id,
          name: college.name,
          location: college.location || 'Location not specified',
        },
        costs: {
          tuitionPerYear: tuitionFees,
          hostelPerYear: hostelFees,
          otherPerYear: otherFees,
          totalFor4Years: totalFees,
        },
        scholarships: applicableScholarships.slice(0, 3),
        scholarshipAmount,
        netCost,
        loanRequired: netCost > 0 ? netCost : 0,
        roi: calculateEducationROI(college, netCost),
      });

      report.summary.totalEstimatedCost += totalFees;
      report.summary.totalScholarshipPotential += scholarshipAmount;
    }

    report.summary.netCostAfterAid = report.summary.totalEstimatedCost - report.summary.totalScholarshipPotential;
    report.summary.recommendedLoanAmount = Math.max(0, report.summary.netCostAfterAid);

    res.status(200).json({
      success: true,
      report,
      recommendations: generateFinancialRecommendations(report, user),
    });

  } catch (error) {
    logger.error('Error generating financial report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate financial report',
    });
  }
};

/**
 * Export financial aid report as PDF data
 */
export const exportFinancialReport = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { reportData } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate PDF-ready data structure
    const pdfData = {
      user: {
        name: user.name,
        email: user.email,
        class: user.class,
        category: user.category,
        state: user.state,
      },
      generatedOn: new Date().toISOString(),
      report: reportData,
      disclaimer: 'This report is based on available data and eligibility criteria. Actual amounts may vary. Please verify with respective institutions.',
    };

    res.status(200).json({
      success: true,
      pdfData,
      downloadUrl: `/api/financial-aid/download-pdf/${userId}`, // Would implement actual PDF generation
    });

  } catch (error) {
    logger.error('Error exporting financial report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
    });
  }
};

// Helper functions

const getMatchingScholarships = async (user: any) => {
  const query: any = {
    $and: [
      {
        $or: [
          { eligibility: { $exists: false } },
          { 'eligibility.category': { $in: [user.category, 'All'] } },
        ],
      },
      {
        $or: [
          { 'eligibility.state': { $exists: false } },
          { 'eligibility.state': { $in: [user.state, 'All'] } },
        ],
      },
      {
        $or: [
          { 'eligibility.class': { $exists: false } },
          { 'eligibility.class': user.class },
        ],
      },
    ],
  };

  // Add income criteria if user has provided income
  if (user.income) {
    query.$and.push({
      $or: [
        { 'eligibility.maxIncome': { $exists: false } },
        { 'eligibility.maxIncome': { $gte: user.income } },
      ],
    });
  }

  // Add gender criteria
  if (user.gender) {
    query.$and.push({
      $or: [
        { 'eligibility.gender': { $exists: false } },
        { 'eligibility.gender': { $in: [user.gender, 'All'] } },
      ],
    });
  }

  const scholarships = await Scholarship.find(query)
    .sort({ amount: -1 }) // Sort by amount descending
    .limit(20);

  return scholarships.map(s => ({
    ...s.toObject(),
    matchScore: calculateScholarshipMatchScore(s, user),
  })).sort((a, b) => b.matchScore - a.matchScore);
};

const getSuitableLoans = async (user: any) => {
  const loans = await Loan.find({
    $or: [
      { eligibility: { $exists: false } },
      { 'eligibility.category': { $in: [user.category, 'All'] } },
    ],
  }).sort({ interestRate: 1 }); // Sort by interest rate ascending

  return loans.map(loan => ({
    ...loan.toObject(),
    suitabilityScore: calculateLoanSuitabilityScore(loan, user),
  })).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
};

const calculateScholarshipMatchScore = (scholarship: any, user: any): number => {
  let score = 50; // Base score

  // Category match
  if (scholarship.eligibility?.category?.includes(user.category)) {
    score += 20;
  }

  // State match
  if (scholarship.eligibility?.state?.includes(user.state)) {
    score += 15;
  }

  // Income eligibility
  if (user.income && scholarship.eligibility?.maxIncome) {
    if (user.income <= scholarship.eligibility.maxIncome) {
      score += 10;
    }
  }

  // Gender match
  if (scholarship.eligibility?.gender?.includes(user.gender)) {
    score += 5;
  }

  // Amount factor (higher amounts get higher scores)
  if (scholarship.amount > 50000) score += 10;
  if (scholarship.amount > 100000) score += 5;

  return Math.min(score, 100);
};

const calculateLoanSuitabilityScore = (loan: any, user: any): number => {
  let score = 50; // Base score

  // Lower interest rate = higher score
  if (loan.interestRate < 8) score += 20;
  else if (loan.interestRate < 10) score += 10;

  // Higher max amount = higher score
  if (loan.maxAmount > 2000000) score += 15;
  else if (loan.maxAmount > 1000000) score += 10;

  // Category benefits
  if (loan.eligibility?.category?.includes(user.category) && user.category !== 'General') {
    score += 10;
  }

  // Collateral requirements (no collateral = higher score)
  if (!loan.collateralRequired) {
    score += 5;
  }

  return Math.min(score, 100);
};

const checkScholarshipEligibility = (scholarship: any, user: any) => {
  const eligibility: any = {
    eligible: true,
    reasons: [],
    requirements: [],
  };

  // Check category
  if (scholarship.eligibility?.category && 
      !scholarship.eligibility.category.includes(user.category) &&
      !scholarship.eligibility.category.includes('All')) {
    eligibility.eligible = false;
    eligibility.reasons.push(`Category: Required ${(scholarship.eligibility.category as any).join(' or ')}, you are ${user.category}`);
  }

  // Check state
  if (scholarship.eligibility?.state && 
      !scholarship.eligibility.state.includes(user.state) &&
      !scholarship.eligibility.state.includes('All')) {
    eligibility.eligible = false;
    eligibility.reasons.push(`State: Required ${(scholarship.eligibility.state as any).join(' or ')}, you are from ${user.state}`);
  }

  // Check income
  if (user.income && scholarship.eligibility?.maxIncome && 
      user.income > scholarship.eligibility.maxIncome) {
    eligibility.eligible = false;
    eligibility.reasons.push(`Income: Required below ${scholarship.eligibility.maxIncome}, your family income is ${user.familyIncome}`);
  }

  // Check class
  if (scholarship.eligibility?.class && scholarship.eligibility.class !== user.class) {
    eligibility.eligible = false;
    eligibility.reasons.push(`Academic: Required ${scholarship.eligibility.academicPercentage}%+, you have ${user.academicRecords?.percentage || 'N/A'}%`);
  }

  // Add requirements
  if (scholarship.eligibility?.minMarks) {
    eligibility.requirements.push(`Submit application by ${scholarship.applicationDeadline}`);
  }

  return eligibility;
};

const getApplicationTimeline = (scholarship: any) => {
  const timeline = [];
  
  if (scholarship.applicationDeadline) {
    timeline.push({
      event: 'Application Deadline',
      date: scholarship.applicationDeadline,
      status: new Date() < new Date(scholarship.applicationDeadline) ? 'upcoming' : 'passed',
    });
  }

  if (scholarship.selectionProcess) {
    timeline.push({
      event: 'Selection Process',
      description: scholarship.selectionProcess,
      status: 'upcoming',
    });
  }

  return timeline;
};

const getApplicationSteps = (scholarship: any) => {
  return [
    'Visit official website',
    'Check eligibility criteria',
    'Gather required documents',
    'Fill online application form',
    'Upload documents',
    'Submit application',
    'Pay application fee (if any)',
    'Track application status',
  ];
};

const getRequiredDocuments = (scholarship: any) => {
  const commonDocs = [
    'Aadhaar Card',
    'Income Certificate',
    'Caste Certificate (if applicable)',
    'Academic Transcripts',
    'Bank Account Details',
    'Passport Size Photographs',
  ];

  if (scholarship.requiredDocuments) {
    return [...commonDocs, ...scholarship.requiredDocuments];
  }

  return commonDocs;
};

const isScholarshipApplicableToCollege = (scholarship: any, college: any): boolean => {
  // Check if scholarship is applicable to this type of college
  if (scholarship.applicableInstitutions) {
    const institutionTypes = scholarship.applicableInstitutions;
    if (!institutionTypes.includes(college.type) && !institutionTypes.includes('All')) {
      return false;
    }
  }

  return true;
};

const calculateEducationROI = (college: any, netCost: number): number => {
  const avgPackage = college.placement?.averagePackage || 0;
  if (netCost === 0) return Infinity;
  return Math.round((avgPackage / netCost) * 100);
};

const generateFinancialRecommendations = (report: any, user: any) => {
  const recommendations = [];

  // Best value college
  const bestValue = report.colleges.reduce((best: any, current: any) => 
    current.roi > best.roi ? current : best
  );
  recommendations.push({
    type: 'Best Value',
    title: `${bestValue.college.name} offers the best ROI`,
    description: `With an ROI of ${bestValue.roi}%, this college provides excellent value for money.`,
  });

  // Most affordable option
  const mostAffordable = report.colleges.reduce((best: any, current: any) => 
    current.netCost < best.netCost ? current : best
  );
  recommendations.push({
    type: 'Most Affordable',
    title: `${mostAffordable.college.name} is the most affordable`,
    description: `Net cost of ₹${mostAffordable.netCost.toLocaleString()} after scholarships.`,
  });

  // Scholarship strategy
  if (report.scholarships.length > 0) {
    recommendations.push({
      type: 'Scholarship Strategy',
      title: 'Apply for multiple scholarships',
      description: `You're eligible for ${report.scholarships.length} scholarships worth up to ₹${report.summary.totalScholarshipPotential.toLocaleString()}.`,
    });
  }

  return recommendations;
};
