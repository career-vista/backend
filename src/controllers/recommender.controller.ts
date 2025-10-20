import { Request, Response } from 'express';
import User from '../models/User';
import { logger } from '../utils/logger';
import { getAIStreamRecommendations } from '../utils/ai';

// In a real app, we would use OpenAI API for recommendations
// For now, we'll use a simple rule-based system

/**
 * Get stream recommendations based on test scores and interests
 */
export const getStreamRecommendations = async (req: Request, res: Response) => {
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
    
    // Check if user has taken the academic test
    if (!user.testScores?.fundamentals) {
      return res.status(400).json({
        success: false,
        message: 'You need to take the academic test first',
      });
    }
    
    // Get test scores and interests
    const { subjects } = user.testScores.fundamentals;
    const interests = user.interests || [];

    // Try AI first, then fallback to rule-based
    let recommendations: any[] = []
    try {
      const aiRecs = await getAIStreamRecommendations({
        classLevel: (user.class === 10 ? '10th' : '12th'),
        scores: {
          math: subjects.math,
          science: subjects.science,
          english: subjects.english,
          socialScience: subjects.socialScience,
        },
        interests,
        category: user.category as any,
        state: user.state,
      })
      recommendations = aiRecs.map(r => ({
        stream: mapToBoardStreams(r.stream),
        confidence: r.confidence,
        description: r.rationale,
      }))
    } catch (e) {
      const rb = generateRecommendations(subjects, interests)
      recommendations = rb
    }
    
    // Note: Stream recommendations are now handled through the response data
    // No longer storing in database
    
    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    logger.error('Error getting stream recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
    });
  }
};

/**
 * Get career options for a specific stream
 */
export const getCareerOptions = async (req: Request, res: Response) => {
  try {
    const { stream } = req.params;
    
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
    
    // Get career options for stream
    const careers = getCareerOptionsForStream(stream);
    
    res.status(200).json({
      success: true,
      stream,
      careers,
    });
  } catch (error) {
    logger.error('Error getting career options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get career options',
    });
  }
};

/**
 * Generate recommendations based on scores and interests
 * This is a simple rule-based system
 * In a real app, we would use OpenAI API for this
 */
const generateRecommendations = (subjects: any, interests: string[]) => {
  const recommendations = [];
  
  // Science stream
  if (subjects.math >= 70 && subjects.science >= 70) {
    let confidence = (subjects.math + subjects.science) / 2;
    
    // Adjust confidence based on interests
    if (interests.some(interest => [
      'mathematics',
      'physics',
      'chemistry',
      'biology',
      'science',
      'research',
      'laboratory',
      'experiment',
    ].includes(interest.toLowerCase()))) {
      confidence += 10;
    }
    
    recommendations.push({
      stream: 'Science',
      confidence: Math.min(confidence, 100),
      description: 'The Science stream focuses on subjects like Physics, Chemistry, Biology, and Mathematics. It prepares students for careers in engineering, medicine, research, and technology.',
      careerOptions: [
        'Engineer',
        'Doctor',
        'Scientist',
        'Researcher',
        'Pharmacist',
      ],
      topColleges: [
        'Indian Institute of Science, Bangalore',
        'St. Stephen\'s College, Delhi',
        'Loyola College, Chennai',
      ],
    });
  }
  
  // Commerce stream
  if (subjects.math >= 60 && subjects.english >= 60) {
    let confidence = (subjects.math + subjects.english) / 2;
    
    // Adjust confidence based on interests
    if (interests.some(interest => [
      'business',
      'economics',
      'accounting',
      'finance',
      'marketing',
      'management',
      'entrepreneurship',
    ].includes(interest.toLowerCase()))) {
      confidence += 10;
    }
    
    recommendations.push({
      stream: 'Commerce',
      confidence: Math.min(confidence, 100),
      description: 'The Commerce stream focuses on subjects like Accountancy, Business Studies, Economics, and Mathematics. It prepares students for careers in business, finance, accounting, and management.',
      careerOptions: [
        'Chartered Accountant',
        'Business Manager',
        'Investment Banker',
        'Financial Analyst',
        'Entrepreneur',
      ],
      topColleges: [
        'Shri Ram College of Commerce, Delhi',
        'St. Xavier\'s College, Kolkata',
        'Christ University, Bangalore',
      ],
    });
  }
  
  // Arts stream
  if (subjects.english >= 70 && subjects.socialScience >= 70) {
    let confidence = (subjects.english + subjects.socialScience) / 2;
    
    // Adjust confidence based on interests
    if (interests.some(interest => [
      'literature',
      'history',
      'geography',
      'political science',
      'sociology',
      'psychology',
      'philosophy',
      'arts',
      'humanities',
      'writing',
      'journalism',
    ].includes(interest.toLowerCase()))) {
      confidence += 10;
    }
    
    recommendations.push({
      stream: 'Arts',
      confidence: Math.min(confidence, 100),
      description: 'The Arts stream focuses on subjects like History, Geography, Political Science, Sociology, Psychology, and Literature. It prepares students for careers in social sciences, humanities, media, and creative fields.',
      careerOptions: [
        'Journalist',
        'Psychologist',
        'Social Worker',
        'Content Writer',
        'Teacher',
        'Civil Services',
      ],
      topColleges: [
        'Lady Shri Ram College, Delhi',
        'St. Xavier\'s College, Mumbai',
        'Presidency College, Kolkata',
      ],
    });
  }
  
  // If no recommendations, add a general one
  if (recommendations.length === 0) {
    recommendations.push({
      stream: 'General',
      confidence: 60,
      description: 'Based on your scores, you have a balanced aptitude across different subjects. Consider exploring multiple streams to find what interests you most.',
      careerOptions: [
        'Explore different fields',
        'Take career counseling',
        'Consider vocational courses',
      ],
      topColleges: [
        'Delhi University',
        'Mumbai University',
        'Bangalore University',
      ],
    });
  }
  
  // Sort by confidence
  return recommendations.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Get comprehensive career options for a specific stream with detailed information
 */
const getCareerOptionsForStream = (stream: string) => {
  switch (stream) {
    case 'Science':
    case 'MPC':
      return [
        {
          title: 'Software Engineer',
          description: 'Design, develop, and maintain software applications and systems.',
          educationPath: 'B.Tech Computer Science → M.Tech/MS (optional) → Industry Experience',
          skillsRequired: ['Programming (Python, Java, C++)', 'Data Structures', 'Algorithms', 'System Design', 'Cloud Computing'],
          averageSalary: '₹6-25 lakhs per annum',
          topSalary: '₹50+ lakhs per annum',
          growthProspects: 'Excellent - 25% annual growth in IT sector',
          jobAvailability: 'Very High - 50,000+ openings annually',
          tuitionRange: '₹2-8 lakhs for B.Tech',
          roi: '300-500% over 5 years',
          trendingIndustries: ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'Fintech', 'E-commerce'],
          topColleges: ['IITs', 'NITs', 'BITS Pilani', 'IIITs', 'VIT'],
          careerRoadmap: {
            step1: { phase: 'Foundation (10th-12th)', tasks: ['Focus on Math & Physics', 'Prepare for JEE Main/Advanced', 'Build programming basics'] },
            step2: { phase: 'Undergraduate (4 years)', tasks: ['B.Tech in Computer Science', 'Internships in tech companies', 'Build projects and portfolio'] },
            step3: { phase: 'Graduate (Optional 2 years)', tasks: ['M.Tech/MS for specialization', 'Research in emerging technologies', 'Industry collaboration'] },
            step4: { phase: 'Professional (2-5 years)', tasks: ['Join as Software Engineer', 'Gain expertise in specific domains', 'Lead technical projects'] },
            step5: { phase: 'Senior Level (5+ years)', tasks: ['Tech Lead/Architect roles', 'Start own company', 'Mentor junior developers'] }
          }
        },
        {
          title: 'Data Scientist',
          description: 'Extract insights from data using statistical analysis and machine learning.',
          educationPath: 'B.Tech/B.Sc → M.Tech/MS in Data Science → Industry Experience',
          skillsRequired: ['Python/R', 'Machine Learning', 'Statistics', 'SQL', 'Big Data Tools'],
          averageSalary: '₹8-30 lakhs per annum',
          topSalary: '₹60+ lakhs per annum',
          growthProspects: 'Exceptional - 35% annual growth',
          jobAvailability: 'High - 15,000+ openings annually',
          tuitionRange: '₹3-10 lakhs for specialized programs',
          roi: '400-600% over 5 years',
          trendingIndustries: ['Healthcare Analytics', 'Financial Services', 'E-commerce', 'Automotive', 'Gaming'],
          topColleges: ['IITs', 'IIITs', 'ISI Kolkata', 'IISc Bangalore', 'BITS Pilani'],
          careerRoadmap: {
            step1: { phase: 'Foundation (10th-12th)', tasks: ['Strong Math & Statistics', 'Basic programming', 'Analytical thinking development'] },
            step2: { phase: 'Undergraduate (4 years)', tasks: ['B.Tech/B.Sc in relevant field', 'Learn programming languages', 'Statistics and probability'] },
            step3: { phase: 'Graduate (2 years)', tasks: ['M.Tech/MS in Data Science', 'Machine Learning specialization', 'Research projects'] },
            step4: { phase: 'Professional (2-5 years)', tasks: ['Junior Data Scientist role', 'Build ML models', 'Industry domain expertise'] },
            step5: { phase: 'Senior Level (5+ years)', tasks: ['Senior Data Scientist', 'Lead AI initiatives', 'Chief Data Officer roles'] }
          }
        },
        {
          title: 'Mechanical Engineer',
          description: 'Design, analyze, and manufacture mechanical systems and devices.',
          educationPath: 'B.Tech Mechanical → M.Tech (optional) → Industry Experience',
          skillsRequired: ['CAD/CAM', 'Manufacturing Processes', 'Thermodynamics', 'Materials Science', 'Project Management'],
          averageSalary: '₹4-18 lakhs per annum',
          topSalary: '₹35+ lakhs per annum',
          growthProspects: 'Good - 15% annual growth',
          jobAvailability: 'Moderate - 25,000+ openings annually',
          tuitionRange: '₹2-6 lakhs for B.Tech',
          roi: '250-400% over 5 years',
          trendingIndustries: ['Automotive', 'Aerospace', 'Renewable Energy', 'Robotics', 'Manufacturing'],
          topColleges: ['IITs', 'NITs', 'BITS Pilani', 'VIT', 'Manipal Institute'],
          careerRoadmap: {
            step1: { phase: 'Foundation (10th-12th)', tasks: ['Strong Physics & Math', 'Prepare for JEE Main', 'Basic engineering concepts'] },
            step2: { phase: 'Undergraduate (4 years)', tasks: ['B.Tech Mechanical Engineering', 'CAD software proficiency', 'Internships in manufacturing'] },
            step3: { phase: 'Graduate (Optional 2 years)', tasks: ['M.Tech specialization', 'Research in emerging areas', 'Industry collaboration'] },
            step4: { phase: 'Professional (2-5 years)', tasks: ['Design Engineer role', 'Manufacturing experience', 'Project management skills'] },
            step5: { phase: 'Senior Level (5+ years)', tasks: ['Senior Engineer/Manager', 'Technical leadership', 'Consulting opportunities'] }
          }
        }
      ];
      
    case 'Commerce':
    case 'MEC':
      return [
        {
          title: 'Chartered Accountant',
          description: 'Manage financial accounts, auditing, and provide financial advice.',
          educationPath: 'B.Com → CA Foundation → CA Intermediate → CA Final → Industry Experience',
          skillsRequired: ['Numerical skills', 'Analytical thinking', 'Attention to detail', 'Integrity', 'Taxation Laws'],
          averageSalary: '₹8-35 lakhs per annum',
          topSalary: '₹1+ crore per annum',
          growthProspects: 'Excellent - 20% annual growth in financial services',
          jobAvailability: 'High - 30,000+ openings annually',
          tuitionRange: '₹3-8 lakhs for CA course',
          roi: '400-800% over 5 years',
          trendingIndustries: ['Fintech', 'Consulting', 'Investment Banking', 'Corporate Finance', 'Startups'],
          topColleges: ['ICAI', 'Delhi University', 'Mumbai University', 'SRCC', 'Loyola College'],
          careerRoadmap: {
            step1: { phase: 'Foundation (10th-12th)', tasks: ['Strong Math & Accounts', 'Commerce subjects focus', 'Basic business concepts'] },
            step2: { phase: 'Undergraduate (3 years)', tasks: ['B.Com/BBA', 'CA Foundation preparation', 'Internships in accounting firms'] },
            step3: { phase: 'Professional (3 years)', tasks: ['CA Intermediate & Final', 'Articleship training', 'Specialization in taxation/audit'] },
            step4: { phase: 'Professional (2-5 years)', tasks: ['CA practice or corporate role', 'Build client base', 'Specialize in specific sectors'] },
            step5: { phase: 'Senior Level (5+ years)', tasks: ['Partner in CA firm', 'CFO roles', 'Financial consulting'] }
          }
        },
        {
          title: 'Investment Banker',
          description: 'Help companies and governments raise capital and provide financial advice.',
          educationPath: 'B.Com/BBA → MBA Finance → Investment Banking Certification → Industry Experience',
          skillsRequired: ['Financial analysis', 'Negotiation', 'Communication', 'Work ethic', 'Excel Modeling'],
          averageSalary: '₹15-50 lakhs per annum',
          topSalary: '₹2+ crore per annum',
          growthProspects: 'Excellent - 25% annual growth',
          jobAvailability: 'Moderate - 5,000+ openings annually',
          tuitionRange: '₹10-25 lakhs for top MBA',
          roi: '500-1000% over 5 years',
          trendingIndustries: ['M&A Advisory', 'Equity Research', 'Private Equity', 'Hedge Funds', 'Fintech'],
          topColleges: ['IIMs', 'ISB', 'XLRI', 'FMS Delhi', 'SP Jain'],
          careerRoadmap: {
            step1: { phase: 'Foundation (10th-12th)', tasks: ['Strong Math & Economics', 'Analytical thinking', 'Current affairs awareness'] },
            step2: { phase: 'Undergraduate (3-4 years)', tasks: ['B.Com/BBA/Economics', 'Finance internships', 'GMAT preparation'] },
            step3: { phase: 'Graduate (2 years)', tasks: ['MBA from top B-school', 'Summer internships in IB', 'Financial modeling skills'] },
            step4: { phase: 'Professional (2-5 years)', tasks: ['Analyst/Associate roles', 'Deal execution experience', 'Client relationship building'] },
            step5: { phase: 'Senior Level (5+ years)', tasks: ['VP/Director roles', 'Deal origination', 'Team leadership'] }
          }
        },
        {
          title: 'Management Consultant',
          description: 'Help organizations improve performance through strategic analysis and recommendations.',
          educationPath: 'B.Com/BBA → MBA → Consulting Certification → Industry Experience',
          skillsRequired: ['Problem-solving', 'Communication', 'Analytical thinking', 'Industry knowledge', 'Presentation skills'],
          averageSalary: '₹12-40 lakhs per annum',
          topSalary: '₹1.5+ crore per annum',
          growthProspects: 'Very Good - 18% annual growth',
          jobAvailability: 'Moderate - 8,000+ openings annually',
          tuitionRange: '₹8-20 lakhs for MBA',
          roi: '350-600% over 5 years',
          trendingIndustries: ['Digital Transformation', 'Sustainability', 'Healthcare', 'Technology', 'Financial Services'],
          topColleges: ['IIMs', 'ISB', 'XLRI', 'McKinsey Academy', 'Deloitte University'],
          careerRoadmap: {
            step1: { phase: 'Foundation (10th-12th)', tasks: ['Strong analytical subjects', 'Case study practice', 'Leadership activities'] },
            step2: { phase: 'Undergraduate (3-4 years)', tasks: ['B.Com/BBA', 'Consulting internships', 'Case competition participation'] },
            step3: { phase: 'Graduate (2 years)', tasks: ['MBA from top school', 'Consulting summer internships', 'Industry specialization'] },
            step4: { phase: 'Professional (2-5 years)', tasks: ['Junior Consultant role', 'Project management', 'Client interaction'] },
            step5: { phase: 'Senior Level (5+ years)', tasks: ['Senior Consultant/Principal', 'Practice leadership', 'Business development'] }
          }
        }
      ];

    case 'BiPC':
      return [
        {
          title: 'Doctor (MBBS)',
          description: 'Diagnose and treat illnesses, injuries, and other health conditions.',
          educationPath: '12th BiPC → NEET → MBBS → MD/MS (optional) → Specialization',
          skillsRequired: ['Biology knowledge', 'Empathy', 'Communication', 'Decision-making', 'Problem-solving'],
          averageSalary: '₹8-40 lakhs per annum',
          topSalary: '₹1+ crore per annum',
          growthProspects: 'Excellent - Always in demand',
          jobAvailability: 'High - 15,000+ MBBS seats annually',
          tuitionRange: '₹5-50 lakhs for MBBS',
          roi: '300-600% over 8 years',
          trendingIndustries: ['Telemedicine', 'Medical Technology', 'Healthcare AI', 'Preventive Medicine', 'Research'],
          topColleges: ['AIIMS', 'JIPMER', 'CMC Vellore', 'Armed Forces Medical College', 'State Medical Colleges'],
          careerRoadmap: {
            step1: { phase: 'Foundation (10th-12th)', tasks: ['Strong Biology, Physics, Chemistry', 'NEET preparation', 'Medical awareness'] },
            step2: { phase: 'Undergraduate (5.5 years)', tasks: ['MBBS degree', 'Clinical rotations', 'Internship training'] },
            step3: { phase: 'Graduate (3-5 years)', tasks: ['MD/MS specialization', 'Residency training', 'Research projects'] },
            step4: { phase: 'Professional (2-5 years)', tasks: ['Junior Doctor role', 'Specialization practice', 'Continuous learning'] },
            step5: { phase: 'Senior Level (5+ years)', tasks: ['Senior Consultant', 'Department head', 'Medical research'] }
          }
        },
        {
          title: 'Biotechnologist',
          description: 'Apply biological processes to develop products and technologies.',
          educationPath: '12th BiPC → B.Tech Biotechnology → M.Tech/Ph.D → Industry Experience',
          skillsRequired: ['Biology', 'Chemistry', 'Lab techniques', 'Research skills', 'Data analysis'],
          averageSalary: '₹5-25 lakhs per annum',
          topSalary: '₹50+ lakhs per annum',
          growthProspects: 'Very Good - 20% annual growth',
          jobAvailability: 'Moderate - 8,000+ openings annually',
          tuitionRange: '₹3-8 lakhs for B.Tech',
          roi: '250-500% over 5 years',
          trendingIndustries: ['Pharmaceuticals', 'Agriculture', 'Healthcare', 'Environmental', 'Food Technology'],
          topColleges: ['IITs', 'NITs', 'BITS Pilani', 'VIT', 'Manipal Institute'],
          careerRoadmap: {
            step1: { phase: 'Foundation (10th-12th)', tasks: ['Strong Biology & Chemistry', 'Basic lab skills', 'Scientific thinking'] },
            step2: { phase: 'Undergraduate (4 years)', tasks: ['B.Tech Biotechnology', 'Lab internships', 'Research projects'] },
            step3: { phase: 'Graduate (2-3 years)', tasks: ['M.Tech/Ph.D', 'Specialization', 'Industry collaboration'] },
            step4: { phase: 'Professional (2-5 years)', tasks: ['Research Scientist', 'Product development', 'Industry expertise'] },
            step5: { phase: 'Senior Level (5+ years)', tasks: ['Senior Scientist', 'R&D leadership', 'Innovation management'] }
          }
        },
        {
          title: 'Pharmacist',
          description: 'Prepare and dispense medications, and provide advice on their use.',
          educationPath: '12th BiPC → B.Pharm → M.Pharm (optional) → Industry Experience',
          skillsRequired: ['Chemistry knowledge', 'Precision', 'Communication', 'Ethical judgment', 'Drug interactions'],
          averageSalary: '₹4-15 lakhs per annum',
          topSalary: '₹30+ lakhs per annum',
          growthProspects: 'Good - 15% annual growth',
          jobAvailability: 'High - 20,000+ openings annually',
          tuitionRange: '₹2-6 lakhs for B.Pharm',
          roi: '200-400% over 4 years',
          trendingIndustries: ['Pharmaceuticals', 'Hospital Pharmacy', 'Clinical Research', 'Drug Development', 'Regulatory Affairs'],
          topColleges: ['NIPER', 'BITS Pilani', 'Manipal College', 'JSS College', 'Delhi University'],
          careerRoadmap: {
            step1: { phase: 'Foundation (10th-12th)', tasks: ['Strong Chemistry & Biology', 'Basic pharmacy concepts', 'Attention to detail'] },
            step2: { phase: 'Undergraduate (4 years)', tasks: ['B.Pharm degree', 'Hospital internships', 'Community pharmacy experience'] },
            step3: { phase: 'Graduate (Optional 2 years)', tasks: ['M.Pharm specialization', 'Research projects', 'Industry internships'] },
            step4: { phase: 'Professional (2-5 years)', tasks: ['Hospital/Retail pharmacist', 'Clinical research', 'Regulatory compliance'] },
            step5: { phase: 'Senior Level (5+ years)', tasks: ['Pharmacy manager', 'Clinical specialist', 'Pharmaceutical consultant'] }
          }
        }
      ];
      
    case 'Arts':
    case 'HEC':
      return [
        {
          title: 'Journalist',
          description: 'Research, write, and report news stories for various media outlets.',
          educationPath: '12th Arts → BA Journalism → MA (optional) → Industry Experience',
          skillsRequired: ['Writing skills', 'Research', 'Communication', 'Critical thinking', 'Digital media'],
          averageSalary: '₹4-20 lakhs per annum',
          topSalary: '₹50+ lakhs per annum',
          growthProspects: 'Good - 12% annual growth',
          jobAvailability: 'Moderate - 10,000+ openings annually',
          tuitionRange: '₹1-5 lakhs for BA',
          roi: '200-400% over 3 years',
          trendingIndustries: ['Digital Media', 'Podcasting', 'Video Journalism', 'Data Journalism', 'Social Media'],
          topColleges: ['Delhi University', 'Jamia Millia', 'XIC Mumbai', 'IIMC', 'Symbiosis'],
          careerRoadmap: {
            step1: { phase: 'Foundation (10th-12th)', tasks: ['Strong English & Social Studies', 'Current affairs awareness', 'Writing practice'] },
            step2: { phase: 'Undergraduate (3 years)', tasks: ['BA Journalism', 'Media internships', 'Portfolio building'] },
            step3: { phase: 'Graduate (Optional 2 years)', tasks: ['MA in Journalism', 'Specialization', 'Advanced skills'] },
            step4: { phase: 'Professional (2-5 years)', tasks: ['Junior reporter role', 'Beat specialization', 'Network building'] },
            step5: { phase: 'Senior Level (5+ years)', tasks: ['Senior journalist', 'Editorial roles', 'Media entrepreneurship'] }
          }
        },
        {
          title: 'Psychologist',
          description: 'Study human behavior and mental processes to help people overcome challenges.',
          educationPath: '12th Arts → BA Psychology → MA → M.Phil/Ph.D → Clinical Practice',
          skillsRequired: ['Empathy', 'Communication', 'Analytical thinking', 'Patience', 'Research skills'],
          averageSalary: '₹6-30 lakhs per annum',
          topSalary: '₹1+ crore per annum',
          growthProspects: 'Excellent - 25% annual growth',
          jobAvailability: 'High - 12,000+ openings annually',
          tuitionRange: '₹2-8 lakhs for complete education',
          roi: '300-600% over 6 years',
          trendingIndustries: ['Clinical Psychology', 'Corporate Psychology', 'Educational Psychology', 'Sports Psychology', 'AI Psychology'],
          topColleges: ['Delhi University', 'TISS Mumbai', 'NIMHANS', 'Ambedkar University', 'JNU'],
          careerRoadmap: {
            step1: { phase: 'Foundation (10th-12th)', tasks: ['Strong Psychology & Biology', 'Human behavior interest', 'Communication skills'] },
            step2: { phase: 'Undergraduate (3 years)', tasks: ['BA Psychology', 'Research projects', 'Internships in mental health'] },
            step3: { phase: 'Graduate (2-3 years)', tasks: ['MA Psychology', 'Clinical training', 'Specialization choice'] },
            step4: { phase: 'Professional (2-5 years)', tasks: ['Licensed psychologist', 'Clinical practice', 'Continuous education'] },
            step5: { phase: 'Senior Level (5+ years)', tasks: ['Senior psychologist', 'Private practice', 'Research & teaching'] }
          }
        },
        {
          title: 'Civil Services Officer',
          description: 'Work in government administration and policy implementation.',
          educationPath: 'Any bachelor\'s degree followed by UPSC examination',
          skillsRequired: ['General knowledge', 'Administrative skills', 'Integrity', 'Decision-making'],
          averageSalary: '₹5-15 lakhs per annum',
          growthProspects: 'Prestigious career with job security and opportunities to impact society',
        },
        {
          title: 'Content Writer',
          description: 'Create written content for websites, publications, and marketing materials.',
          educationPath: 'BA in English, Journalism, or related field',
          skillsRequired: ['Writing skills', 'Creativity', 'Research', 'Adaptability'],
          averageSalary: '₹3-12 lakhs per annum',
          growthProspects: 'Growing demand in digital marketing, publishing, and corporate communications',
        },
      ];
      
    case 'Engineering':
      return [
        {
          title: 'Software Engineer',
          description: 'Design, develop, and maintain software applications and systems.',
          educationPath: 'B.Tech/B.E. in Computer Science or related field',
          skillsRequired: ['Programming', 'Problem-solving', 'Logical thinking', 'Teamwork'],
          averageSalary: '₹5-30 lakhs per annum',
          growthProspects: 'High demand across all industries, especially tech companies',
        },
        {
          title: 'Mechanical Engineer',
          description: 'Design, develop, build, and test mechanical devices and systems.',
          educationPath: 'B.Tech/B.E. in Mechanical Engineering',
          skillsRequired: ['Technical knowledge', 'CAD skills', 'Problem-solving', 'Creativity'],
          averageSalary: '₹4-20 lakhs per annum',
          growthProspects: 'Opportunities in manufacturing, automotive, aerospace, and energy sectors',
        },
        {
          title: 'Civil Engineer',
          description: 'Design, develop, and supervise infrastructure projects.',
          educationPath: 'B.Tech/B.E. in Civil Engineering',
          skillsRequired: ['Technical knowledge', 'Project management', 'Problem-solving', 'Attention to detail'],
          averageSalary: '₹3-18 lakhs per annum',
          growthProspects: 'Opportunities in construction, infrastructure development, and consulting',
        },
        {
          title: 'Electronics Engineer',
          description: 'Design and develop electronic equipment and systems.',
          educationPath: 'B.Tech/B.E. in Electronics Engineering',
          skillsRequired: ['Technical knowledge', 'Circuit design', 'Problem-solving', 'Attention to detail'],
          averageSalary: '₹4-20 lakhs per annum',
          growthProspects: 'Opportunities in telecommunications, consumer electronics, and semiconductor industries',
        },
      ];
      
    case 'Medical':
      return [
        {
          title: 'General Physician',
          description: 'Diagnose and treat common illnesses and refer patients to specialists when needed.',
          educationPath: 'MBBS',
          skillsRequired: ['Medical knowledge', 'Diagnostic skills', 'Communication', 'Empathy'],
          averageSalary: '₹5-25 lakhs per annum',
          growthProspects: 'Always in demand, opportunities in hospitals, clinics, and private practice',
        },
        {
          title: 'Surgeon',
          description: 'Perform operations to treat injuries, diseases, and deformities.',
          educationPath: 'MBBS followed by MS in Surgery',
          skillsRequired: ['Surgical skills', 'Steady hands', 'Decision-making', 'Stress management'],
          averageSalary: '₹10-50 lakhs per annum',
          growthProspects: 'High demand for various specializations, opportunities in hospitals and private practice',
        },
        {
          title: 'Dentist',
          description: 'Diagnose and treat problems related to teeth and gums.',
          educationPath: 'BDS, MDS',
          skillsRequired: ['Dental knowledge', 'Manual dexterity', 'Communication', 'Attention to detail'],
          averageSalary: '₹5-30 lakhs per annum',
          growthProspects: 'Growing awareness of dental health, opportunities for private practice',
        },
        {
          title: 'Psychiatrist',
          description: 'Diagnose and treat mental health disorders.',
          educationPath: 'MBBS followed by MD in Psychiatry',
          skillsRequired: ['Medical knowledge', 'Empathy', 'Communication', 'Analytical thinking'],
          averageSalary: '₹8-40 lakhs per annum',
          growthProspects: 'Growing awareness of mental health, increasing demand for services',
        },
      ];
      
    case 'Law':
      return [
        {
          title: 'Corporate Lawyer',
          description: 'Handle legal matters for businesses and corporations.',
          educationPath: 'LLB, LLM in Corporate Law',
          skillsRequired: ['Legal knowledge', 'Negotiation', 'Communication', 'Analytical thinking'],
          averageSalary: '₹5-30 lakhs per annum',
          growthProspects: 'High demand in corporate sector, opportunities in law firms and in-house legal departments',
        },
        {
          title: 'Litigation Lawyer',
          description: 'Represent clients in court proceedings.',
          educationPath: 'LLB',
          skillsRequired: ['Legal knowledge', 'Advocacy', 'Research', 'Communication'],
          averageSalary: '₹4-25 lakhs per annum',
          growthProspects: 'Always in demand, opportunities for private practice and in law firms',
        },
        {
          title: 'Judge',
          description: 'Preside over court proceedings and make judgments.',
          educationPath: 'LLB followed by judicial services examination',
          skillsRequired: ['Legal knowledge', 'Impartiality', 'Decision-making', 'Integrity'],
          averageSalary: '₹8-20 lakhs per annum',
          growthProspects: 'Prestigious career with job security and opportunities to impact society',
        },
        {
          title: 'Legal Consultant',
          description: 'Provide legal advice to individuals, businesses, and organizations.',
          educationPath: 'LLB, specialized certifications',
          skillsRequired: ['Legal knowledge', 'Communication', 'Problem-solving', 'Business acumen'],
          averageSalary: '₹5-25 lakhs per annum',
          growthProspects: 'Opportunities in consulting firms, NGOs, and as independent consultants',
        },
      ];
      
    case 'Management':
      return [
        {
          title: 'Marketing Manager',
          description: 'Develop and implement marketing strategies to promote products or services.',
          educationPath: 'BBA, MBA in Marketing',
          skillsRequired: ['Marketing knowledge', 'Creativity', 'Communication', 'Analytical thinking'],
          averageSalary: '₹6-25 lakhs per annum',
          growthProspects: 'Opportunities across all industries, potential for senior executive roles',
        },
        {
          title: 'Human Resources Manager',
          description: 'Manage recruitment, employee relations, and organizational development.',
          educationPath: 'BBA, MBA in HR',
          skillsRequired: ['People skills', 'Communication', 'Negotiation', 'Ethical judgment'],
          averageSalary: '₹5-20 lakhs per annum',
          growthProspects: 'Essential role in all medium to large organizations',
        },
        {
          title: 'Operations Manager',
          description: 'Oversee production of goods or services and ensure efficiency.',
          educationPath: 'BBA, MBA in Operations',
          skillsRequired: ['Process knowledge', 'Problem-solving', 'Leadership', 'Decision-making'],
          averageSalary: '₹6-25 lakhs per annum',
          growthProspects: 'Opportunities in manufacturing, retail, logistics, and service industries',
        },
        {
          title: 'Financial Manager',
          description: 'Manage financial health of organizations through planning and analysis.',
          educationPath: 'B.Com, MBA in Finance',
          skillsRequired: ['Financial knowledge', 'Analytical thinking', 'Decision-making', 'Attention to detail'],
          averageSalary: '₹7-30 lakhs per annum',
          growthProspects: 'Critical role in all organizations, potential for CFO position',
        },
      ];
      
    default:
      return [];
  }
};

// Map AI short stream codes to app streams
const mapToBoardStreams = (code: string): string => {
  switch ((code || '').toUpperCase()) {
    case 'MPC':
      return 'Science'
    case 'BIPC':
      return 'Medical'
    case 'MEC':
      return 'Commerce'
    case 'CEC':
      return 'Arts'
    case 'HEC':
      return 'Arts'
    default:
      return 'General'
  }
}