import { Request, Response } from 'express';
import User from '../models/User';
import { logger } from '../utils/logger';

/**
 * Get detailed career insights for a specific stream
 */
export const getCareerInsights = async (req: Request, res: Response) => {
  try {
    const { stream } = req.params;
    const userId = req.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get comprehensive career insights
    const insights = await generateCareerInsights(stream, user);

    res.status(200).json({
      success: true,
      stream,
      insights,
    });

  } catch (error) {
    logger.error('Error getting career insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get career insights',
    });
  }
};

/**
 * Get future-proof skills recommendations
 */
export const getFutureProofSkills = async (req: Request, res: Response) => {
  try {
    const { stream } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const skills = await generateFutureProofSkills(stream, user);

    res.status(200).json({
      success: true,
      stream,
      skills,
    });

  } catch (error) {
    logger.error('Error getting future-proof skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get future-proof skills',
    });
  }
};

/**
 * Get course recommendations for skill gaps
 */
export const getCourseRecommendations = async (req: Request, res: Response) => {
  try {
    const { stream } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const courses = await generateCourseRecommendations(stream, user);

    res.status(200).json({
      success: true,
      stream,
      courses,
    });

  } catch (error) {
    logger.error('Error getting course recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course recommendations',
    });
  }
};

/**
 * Get employability insights by region
 */
export const getEmployabilityInsights = async (req: Request, res: Response) => {
  try {
    const { stream } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const insights = await generateEmployabilityInsights(stream, user);

    res.status(200).json({
      success: true,
      stream,
      insights,
    });

  } catch (error) {
    logger.error('Error getting employability insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employability insights',
    });
  }
};

// Helper functions

const generateCareerInsights = async (stream: string, user: any) => {
  const streamData = getStreamCareerData(stream);
  
  return {
    streamInfo: {
      name: streamData.name,
      description: streamData.description,
      totalCareers: streamData.careers.length,
      averageROI: streamData.averageROI,
      marketDemand: streamData.marketDemand,
    },
    topCareers: streamData.careers.slice(0, 5),
    trendingIndustries: streamData.trendingIndustries,
    salaryInsights: streamData.salaryInsights,
    jobMarket: streamData.jobMarket,
    skillGaps: streamData.skillGaps,
    recommendations: streamData.recommendations,
  };
};

const generateFutureProofSkills = async (stream: string, user: any) => {
  const skillsData = getFutureProofSkillsData(stream);
  
  return {
    essentialSkills: skillsData.essential,
    emergingSkills: skillsData.emerging,
    technicalSkills: skillsData.technical,
    softSkills: skillsData.soft,
    skillDevelopmentPath: skillsData.developmentPath,
  };
};

const generateCourseRecommendations = async (stream: string, user: any) => {
  const coursesData = getCourseRecommendationsData(stream);
  
  return {
    freeCourses: coursesData.free,
    paidCourses: coursesData.paid,
    certifications: coursesData.certifications,
    skillGapAnalysis: coursesData.skillGapAnalysis,
  };
};

const generateEmployabilityInsights = async (stream: string, user: any) => {
  const employabilityData = getEmployabilityData(stream);
  
  return {
    tier1Cities: employabilityData.tier1,
    tier2Cities: employabilityData.tier2,
    tier3Cities: employabilityData.tier3,
    remoteOpportunities: employabilityData.remote,
    globalOpportunities: employabilityData.global,
  };
};

const getStreamCareerData = (stream: string) => {
  const streamData: any = {
    MPC: {
      name: 'Mathematics, Physics, Chemistry',
      description: 'Engineering and technology-focused stream with strong analytical foundation',
      averageROI: '350%',
      marketDemand: 'Very High',
      careers: [
        {
          title: 'Software Engineer',
          demand: 'Very High',
          growth: '25%',
          avgSalary: '₹6-25L',
          topSalary: '₹50L+',
          jobOpenings: '50,000+',
          trending: true,
        },
        {
          title: 'Data Scientist',
          demand: 'Very High',
          growth: '35%',
          avgSalary: '₹8-30L',
          topSalary: '₹60L+',
          jobOpenings: '15,000+',
          trending: true,
        },
        {
          title: 'Mechanical Engineer',
          demand: 'High',
          growth: '15%',
          avgSalary: '₹4-18L',
          topSalary: '₹35L+',
          jobOpenings: '25,000+',
          trending: false,
        },
        {
          title: 'Aerospace Engineer',
          demand: 'Moderate',
          growth: '20%',
          avgSalary: '₹6-25L',
          topSalary: '₹40L+',
          jobOpenings: '3,000+',
          trending: true,
        },
        {
          title: 'Robotics Engineer',
          demand: 'High',
          growth: '30%',
          avgSalary: '₹7-28L',
          topSalary: '₹45L+',
          jobOpenings: '8,000+',
          trending: true,
        },
      ],
      trendingIndustries: [
        { name: 'Artificial Intelligence', growth: '40%', opportunities: '15,000+' },
        { name: 'Cloud Computing', growth: '30%', opportunities: '20,000+' },
        { name: 'Cybersecurity', growth: '35%', opportunities: '12,000+' },
        { name: 'Electric Vehicles', growth: '50%', opportunities: '8,000+' },
        { name: 'Space Technology', growth: '25%', opportunities: '2,000+' },
      ],
      salaryInsights: {
        fresher: '₹4-8L',
        experienced: '₹8-20L',
        senior: '₹20-50L',
        top: '₹50L+',
        growthRate: '15-25%',
      },
      jobMarket: {
        totalOpenings: '100,000+',
        competition: 'High',
        remoteWork: '70%',
        international: '25%',
      },
      skillGaps: [
        'Cloud Computing (AWS, Azure)',
        'Machine Learning & AI',
        'DevOps & Automation',
        'Cybersecurity',
        'Data Analytics',
      ],
      recommendations: [
        'Focus on emerging technologies like AI/ML',
        'Build strong programming fundamentals',
        'Gain practical experience through projects',
        'Consider specialization in high-demand areas',
        'Stay updated with industry trends',
      ],
    },
    BiPC: {
      name: 'Biology, Physics, Chemistry',
      description: 'Medical and life sciences stream with focus on healthcare and biotechnology',
      averageROI: '400%',
      marketDemand: 'Very High',
      careers: [
        {
          title: 'Doctor (MBBS)',
          demand: 'Very High',
          growth: 'Always in demand',
          avgSalary: '₹8-40L',
          topSalary: '₹1Cr+',
          jobOpenings: '15,000+',
          trending: true,
        },
        {
          title: 'Biotechnologist',
          demand: 'High',
          growth: '20%',
          avgSalary: '₹5-25L',
          topSalary: '₹50L+',
          jobOpenings: '8,000+',
          trending: true,
        },
        {
          title: 'Pharmacist',
          demand: 'High',
          growth: '15%',
          avgSalary: '₹4-15L',
          topSalary: '₹30L+',
          jobOpenings: '20,000+',
          trending: false,
        },
        {
          title: 'Medical Researcher',
          demand: 'Moderate',
          growth: '18%',
          avgSalary: '₹6-20L',
          topSalary: '₹40L+',
          jobOpenings: '5,000+',
          trending: true,
        },
        {
          title: 'Clinical Data Manager',
          demand: 'High',
          growth: '25%',
          avgSalary: '₹5-18L',
          topSalary: '₹35L+',
          jobOpenings: '6,000+',
          trending: true,
        },
      ],
      trendingIndustries: [
        { name: 'Telemedicine', growth: '60%', opportunities: '10,000+' },
        { name: 'Medical Technology', growth: '25%', opportunities: '8,000+' },
        { name: 'Pharmaceuticals', growth: '20%', opportunities: '15,000+' },
        { name: 'Biotechnology', growth: '30%', opportunities: '12,000+' },
        { name: 'Healthcare AI', growth: '45%', opportunities: '5,000+' },
      ],
      salaryInsights: {
        fresher: '₹3-6L',
        experienced: '₹6-15L',
        senior: '₹15-40L',
        top: '₹40L+',
        growthRate: '15-25%',
      },
      jobMarket: {
        totalOpenings: '60,000+',
        competition: 'Very High',
        remoteWork: '30%',
        international: '15%',
      },
      skillGaps: [
        'Digital Health Technologies',
        'Medical AI & Machine Learning',
        'Clinical Research',
        'Regulatory Affairs',
        'Healthcare Analytics',
      ],
      recommendations: [
        'Consider specialization in emerging medical fields',
        'Build strong research and analytical skills',
        'Stay updated with medical technology trends',
        'Gain practical experience through internships',
        'Consider international opportunities',
      ],
    },
    MEC: {
      name: 'Mathematics, Economics, Commerce',
      description: 'Business and finance-focused stream with strong analytical and commercial skills',
      averageROI: '450%',
      marketDemand: 'High',
      careers: [
        {
          title: 'Chartered Accountant',
          demand: 'High',
          growth: '20%',
          avgSalary: '₹8-35L',
          topSalary: '₹1Cr+',
          jobOpenings: '30,000+',
          trending: false,
        },
        {
          title: 'Investment Banker',
          demand: 'Moderate',
          growth: '25%',
          avgSalary: '₹15-50L',
          topSalary: '₹2Cr+',
          jobOpenings: '5,000+',
          trending: true,
        },
        {
          title: 'Management Consultant',
          demand: 'High',
          growth: '18%',
          avgSalary: '₹12-40L',
          topSalary: '₹1.5Cr+',
          jobOpenings: '8,000+',
          trending: true,
        },
        {
          title: 'Financial Analyst',
          demand: 'High',
          growth: '22%',
          avgSalary: '₹6-20L',
          topSalary: '₹40L+',
          jobOpenings: '15,000+',
          trending: true,
        },
        {
          title: 'Entrepreneur',
          demand: 'Variable',
          growth: 'Unlimited',
          avgSalary: 'Variable',
          topSalary: 'Unlimited',
          jobOpenings: 'Self-created',
          trending: true,
        },
      ],
      trendingIndustries: [
        { name: 'Fintech', growth: '35%', opportunities: '20,000+' },
        { name: 'Digital Banking', growth: '25%', opportunities: '15,000+' },
        { name: 'Investment Management', growth: '20%', opportunities: '8,000+' },
        { name: 'Consulting', growth: '18%', opportunities: '12,000+' },
        { name: 'E-commerce', growth: '30%', opportunities: '25,000+' },
      ],
      salaryInsights: {
        fresher: '₹4-8L',
        experienced: '₹8-25L',
        senior: '₹25-60L',
        top: '₹60L+',
        growthRate: '18-25%',
      },
      jobMarket: {
        totalOpenings: '80,000+',
        competition: 'High',
        remoteWork: '60%',
        international: '30%',
      },
      skillGaps: [
        'Digital Finance & Cryptocurrency',
        'Data Analytics & Business Intelligence',
        'Financial Modeling',
        'Risk Management',
        'Regulatory Compliance',
      ],
      recommendations: [
        'Develop strong analytical and quantitative skills',
        'Stay updated with financial technology trends',
        'Consider professional certifications (CA, CFA, FRM)',
        'Build network in financial services',
        'Gain international exposure',
      ],
    },
    HEC: {
      name: 'History, Economics, Civics',
      description: 'Social sciences and humanities stream with focus on policy, governance, and social impact',
      averageROI: '250%',
      marketDemand: 'Moderate',
      careers: [
        {
          title: 'Civil Services Officer',
          demand: 'High',
          growth: 'Stable',
          avgSalary: '₹5-15L',
          topSalary: '₹25L+',
          jobOpenings: '1,000+',
          trending: false,
        },
        {
          title: 'Journalist',
          demand: 'Moderate',
          growth: '12%',
          avgSalary: '₹4-20L',
          topSalary: '₹50L+',
          jobOpenings: '10,000+',
          trending: true,
        },
        {
          title: 'Psychologist',
          demand: 'High',
          growth: '25%',
          avgSalary: '₹6-30L',
          topSalary: '₹1Cr+',
          jobOpenings: '12,000+',
          trending: true,
        },
        {
          title: 'Social Worker',
          demand: 'Moderate',
          growth: '15%',
          avgSalary: '₹3-12L',
          topSalary: '₹25L+',
          jobOpenings: '8,000+',
          trending: false,
        },
        {
          title: 'Policy Analyst',
          demand: 'High',
          growth: '20%',
          avgSalary: '₹5-18L',
          topSalary: '₹35L+',
          jobOpenings: '5,000+',
          trending: true,
        },
      ],
      trendingIndustries: [
        { name: 'Digital Media', growth: '20%', opportunities: '15,000+' },
        { name: 'Mental Health', growth: '30%', opportunities: '8,000+' },
        { name: 'Public Policy', growth: '15%', opportunities: '3,000+' },
        { name: 'Social Impact', growth: '25%', opportunities: '5,000+' },
        { name: 'Education Technology', growth: '35%', opportunities: '10,000+' },
      ],
      salaryInsights: {
        fresher: '₹2-5L',
        experienced: '₹5-15L',
        senior: '₹15-35L',
        top: '₹35L+',
        growthRate: '12-20%',
      },
      jobMarket: {
        totalOpenings: '40,000+',
        competition: 'Moderate',
        remoteWork: '50%',
        international: '20%',
      },
      skillGaps: [
        'Digital Communication',
        'Data Analysis & Research',
        'Policy Analysis',
        'Social Media Management',
        'Crisis Communication',
      ],
      recommendations: [
        'Develop strong communication and writing skills',
        'Stay updated with social and political trends',
        'Consider specialization in emerging areas',
        'Build network in media and policy circles',
        'Gain practical experience through internships',
      ],
    },
  };

  return streamData[stream] || streamData.MPC;
};

const getFutureProofSkillsData = (stream: string) => {
  const skillsData: any = {
    MPC: {
      essential: [
        { skill: 'Programming (Python, Java, C++)', importance: 'Critical', demand: 'Very High' },
        { skill: 'Data Structures & Algorithms', importance: 'Critical', demand: 'Very High' },
        { skill: 'Mathematics & Statistics', importance: 'Critical', demand: 'High' },
        { skill: 'Problem Solving', importance: 'Critical', demand: 'Very High' },
        { skill: 'System Design', importance: 'High', demand: 'High' },
      ],
      emerging: [
        { skill: 'Artificial Intelligence & Machine Learning', importance: 'Critical', demand: 'Very High' },
        { skill: 'Cloud Computing (AWS, Azure, GCP)', importance: 'Critical', demand: 'Very High' },
        { skill: 'Cybersecurity', importance: 'High', demand: 'Very High' },
        { skill: 'Blockchain Technology', importance: 'Moderate', demand: 'High' },
        { skill: 'Quantum Computing', importance: 'Low', demand: 'Moderate' },
      ],
      technical: [
        { skill: 'Database Management (SQL, NoSQL)', importance: 'High', demand: 'High' },
        { skill: 'DevOps & CI/CD', importance: 'High', demand: 'High' },
        { skill: 'Mobile Development', importance: 'Moderate', demand: 'High' },
        { skill: 'Web Development (Full Stack)', importance: 'High', demand: 'Very High' },
        { skill: 'API Development', importance: 'High', demand: 'High' },
      ],
      soft: [
        { skill: 'Communication', importance: 'Critical', demand: 'Very High' },
        { skill: 'Teamwork', importance: 'Critical', demand: 'Very High' },
        { skill: 'Leadership', importance: 'High', demand: 'High' },
        { skill: 'Adaptability', importance: 'Critical', demand: 'Very High' },
        { skill: 'Critical Thinking', importance: 'Critical', demand: 'Very High' },
      ],
      developmentPath: [
        { phase: 'Foundation', skills: ['Basic Programming', 'Mathematics', 'Problem Solving'] },
        { phase: 'Intermediate', skills: ['Data Structures', 'Web Development', 'Database Management'] },
        { phase: 'Advanced', skills: ['System Design', 'Cloud Computing', 'Machine Learning'] },
        { phase: 'Expert', skills: ['Architecture Design', 'Leadership', 'Mentoring'] },
      ],
    },
    BiPC: {
      essential: [
        { skill: 'Biology & Life Sciences', importance: 'Critical', demand: 'Very High' },
        { skill: 'Chemistry & Biochemistry', importance: 'Critical', demand: 'High' },
        { skill: 'Research & Analysis', importance: 'Critical', demand: 'Very High' },
        { skill: 'Laboratory Techniques', importance: 'High', demand: 'High' },
        { skill: 'Medical Knowledge', importance: 'High', demand: 'Very High' },
      ],
      emerging: [
        { skill: 'Digital Health Technologies', importance: 'Critical', demand: 'Very High' },
        { skill: 'Medical AI & Machine Learning', importance: 'High', demand: 'High' },
        { skill: 'Telemedicine', importance: 'High', demand: 'Very High' },
        { skill: 'Genomics & Personalized Medicine', importance: 'Moderate', demand: 'High' },
        { skill: 'Biotechnology Innovation', importance: 'High', demand: 'High' },
      ],
      technical: [
        { skill: 'Clinical Research', importance: 'High', demand: 'High' },
        { skill: 'Data Analysis (R, Python)', importance: 'High', demand: 'High' },
        { skill: 'Medical Device Technology', importance: 'Moderate', demand: 'Moderate' },
        { skill: 'Pharmaceutical Development', importance: 'High', demand: 'High' },
        { skill: 'Regulatory Affairs', importance: 'High', demand: 'High' },
      ],
      soft: [
        { skill: 'Empathy & Patient Care', importance: 'Critical', demand: 'Very High' },
        { skill: 'Communication', importance: 'Critical', demand: 'Very High' },
        { skill: 'Attention to Detail', importance: 'Critical', demand: 'Very High' },
        { skill: 'Ethical Decision Making', importance: 'Critical', demand: 'Very High' },
        { skill: 'Continuous Learning', importance: 'Critical', demand: 'Very High' },
      ],
      developmentPath: [
        { phase: 'Foundation', skills: ['Basic Sciences', 'Laboratory Skills', 'Medical Terminology'] },
        { phase: 'Intermediate', skills: ['Clinical Skills', 'Research Methods', 'Data Analysis'] },
        { phase: 'Advanced', skills: ['Specialization', 'Technology Integration', 'Leadership'] },
        { phase: 'Expert', skills: ['Innovation', 'Mentoring', 'Policy Development'] },
      ],
    },
  };

  return skillsData[stream] || skillsData.MPC;
};

const getCourseRecommendationsData = (stream: string) => {
  return {
    free: [
      {
        name: 'Introduction to Computer Science',
        platform: 'Coursera',
        duration: '6 months',
        skill: 'Programming Fundamentals',
        rating: 4.8,
        url: 'https://coursera.org/learn/cs101',
      },
      {
        name: 'Machine Learning Course',
        platform: 'edX',
        duration: '4 months',
        skill: 'AI/ML',
        rating: 4.7,
        url: 'https://edx.org/learn/machine-learning',
      },
      {
        name: 'Data Science Specialization',
        platform: 'Coursera',
        duration: '8 months',
        skill: 'Data Analysis',
        rating: 4.6,
        url: 'https://coursera.org/specializations/data-science',
      },
    ],
    paid: [
      {
        name: 'Full Stack Web Development',
        platform: 'Udemy',
        duration: '3 months',
        skill: 'Web Development',
        price: '₹3,999',
        rating: 4.5,
        url: 'https://udemy.com/full-stack-web-development',
      },
      {
        name: 'AWS Cloud Practitioner',
        platform: 'AWS Training',
        duration: '2 months',
        skill: 'Cloud Computing',
        price: '₹5,999',
        rating: 4.8,
        url: 'https://aws.amazon.com/training/',
      },
    ],
    certifications: [
      {
        name: 'Google Cloud Professional',
        provider: 'Google',
        duration: '6 months',
        skill: 'Cloud Computing',
        price: '₹8,999',
        validity: '2 years',
      },
      {
        name: 'Microsoft Azure Fundamentals',
        provider: 'Microsoft',
        duration: '3 months',
        skill: 'Cloud Computing',
        price: '₹4,999',
        validity: '1 year',
      },
    ],
    skillGapAnalysis: {
      currentSkills: ['Basic Programming', 'Mathematics'],
      requiredSkills: ['Advanced Programming', 'Cloud Computing', 'AI/ML'],
      gaps: ['Cloud Computing', 'AI/ML', 'System Design'],
      recommendations: [
        'Start with cloud computing fundamentals',
        'Learn machine learning basics',
        'Practice system design problems',
      ],
    },
  };
};

const getEmployabilityData = (stream: string) => {
  return {
    tier1: {
      cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'],
      opportunities: 'High',
      averageSalary: '₹8-25L',
      competition: 'Very High',
      companies: ['FAANG', 'Unicorns', 'MNCs', 'Startups'],
      growth: '15-25%',
    },
    tier2: {
      cities: ['Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh'],
      opportunities: 'Moderate',
      averageSalary: '₹5-15L',
      competition: 'Moderate',
      companies: ['IT Services', 'Manufacturing', 'Banking', 'Healthcare'],
      growth: '10-20%',
    },
    tier3: {
      cities: ['Indore', 'Bhubaneswar', 'Coimbatore', 'Kochi', 'Vadodara'],
      opportunities: 'Limited',
      averageSalary: '₹3-10L',
      competition: 'Low',
      companies: ['Local IT', 'Government', 'SMEs', 'Educational'],
      growth: '5-15%',
    },
    remote: {
      opportunities: 'High',
      averageSalary: '₹6-20L',
      benefits: ['Work-life balance', 'Cost savings', 'Global opportunities'],
      challenges: ['Communication', 'Isolation', 'Time management'],
      growth: '30%',
    },
    global: {
      opportunities: 'Moderate',
      averageSalary: '₹15-50L',
      countries: ['USA', 'Canada', 'UK', 'Germany', 'Australia'],
      requirements: ['Strong technical skills', 'English proficiency', 'Work visa'],
      growth: '20%',
    },
  };
};


