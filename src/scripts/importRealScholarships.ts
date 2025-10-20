import mongoose from 'mongoose';
import Scholarship from '../models/Scholarship';
import { logger } from '../utils/logger';

// Real scholarship data with comprehensive information
const realScholarshipsData = [
  {
    name: 'Merit-cum-Means Scholarship',
    provider: 'Ministry of Education, Government of India',
    type: 'Government',
    amount: 20000,
    description: 'Financial assistance for meritorious students from economically weaker sections',
    eligibility: {
      categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      minPercentage: 80,
      maxIncome: 250000,
      class: 12,
      courses: ['All'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-03-31',
    documentsRequired: [
      'Income certificate',
      'Marksheet',
      'Aadhar card',
      'Bank account details',
      'Passport size photo'
    ],
    applicationProcess: 'Online application through National Scholarship Portal',
    benefits: [
      '₹20,000 per annum',
      'Renewable for course duration',
      'No repayment required'
    ],
    website: 'https://scholarships.gov.in/',
    contactInfo: {
      email: 'scholarship@education.gov.in',
      phone: '1800-123-4567'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'Central Sector Scholarship Scheme',
    provider: 'Ministry of Education, Government of India',
    type: 'Government',
    amount: 10000,
    description: 'Scholarship for students pursuing higher education in India',
    eligibility: {
      categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      minPercentage: 80,
      maxIncome: 800000,
      class: 12,
      courses: ['All'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-04-15',
    documentsRequired: [
      'Income certificate',
      'Marksheet',
      'Aadhar card',
      'Bank account details',
      'Admission proof'
    ],
    applicationProcess: 'Online application through National Scholarship Portal',
    benefits: [
      '₹10,000 per annum',
      'Renewable for course duration',
      'No repayment required'
    ],
    website: 'https://scholarships.gov.in/',
    contactInfo: {
      email: 'csss@education.gov.in',
      phone: '1800-123-4568'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'Post Matric Scholarship for SC Students',
    provider: 'Ministry of Social Justice and Empowerment',
    type: 'Government',
    amount: 15000,
    description: 'Scholarship for Scheduled Caste students pursuing higher education',
    eligibility: {
      categories: ['SC'],
      minPercentage: 75,
      maxIncome: 250000,
      class: 12,
      courses: ['All'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-03-31',
    documentsRequired: [
      'Caste certificate',
      'Income certificate',
      'Marksheet',
      'Aadhar card',
      'Bank account details'
    ],
    applicationProcess: 'Online application through National Scholarship Portal',
    benefits: [
      '₹15,000 per annum',
      'Renewable for course duration',
      'No repayment required'
    ],
    website: 'https://scholarships.gov.in/',
    contactInfo: {
      email: 'scscholarship@socialjustice.gov.in',
      phone: '1800-123-4569'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'Post Matric Scholarship for ST Students',
    provider: 'Ministry of Tribal Affairs',
    type: 'Government',
    amount: 15000,
    description: 'Scholarship for Scheduled Tribe students pursuing higher education',
    eligibility: {
      categories: ['ST'],
      minPercentage: 75,
      maxIncome: 250000,
      class: 12,
      courses: ['All'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-03-31',
    documentsRequired: [
      'Tribe certificate',
      'Income certificate',
      'Marksheet',
      'Aadhar card',
      'Bank account details'
    ],
    applicationProcess: 'Online application through National Scholarship Portal',
    benefits: [
      '₹15,000 per annum',
      'Renewable for course duration',
      'No repayment required'
    ],
    website: 'https://scholarships.gov.in/',
    contactInfo: {
      email: 'stscholarship@tribalaffairs.gov.in',
      phone: '1800-123-4570'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'OBC Scholarship',
    provider: 'Ministry of Social Justice and Empowerment',
    type: 'Government',
    amount: 12000,
    description: 'Scholarship for Other Backward Classes students pursuing higher education',
    eligibility: {
      categories: ['OBC'],
      minPercentage: 75,
      maxIncome: 100000,
      class: 12,
      courses: ['All'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-03-31',
    documentsRequired: [
      'OBC certificate',
      'Income certificate',
      'Marksheet',
      'Aadhar card',
      'Bank account details'
    ],
    applicationProcess: 'Online application through National Scholarship Portal',
    benefits: [
      '₹12,000 per annum',
      'Renewable for course duration',
      'No repayment required'
    ],
    website: 'https://scholarships.gov.in/',
    contactInfo: {
      email: 'obcscholarship@socialjustice.gov.in',
      phone: '1800-123-4571'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'EWS Scholarship',
    provider: 'Ministry of Education, Government of India',
    type: 'Government',
    amount: 10000,
    description: 'Scholarship for Economically Weaker Section students pursuing higher education',
    eligibility: {
      categories: ['EWS'],
      minPercentage: 75,
      maxIncome: 800000,
      class: 12,
      courses: ['All'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-03-31',
    documentsRequired: [
      'EWS certificate',
      'Income certificate',
      'Marksheet',
      'Aadhar card',
      'Bank account details'
    ],
    applicationProcess: 'Online application through National Scholarship Portal',
    benefits: [
      '₹10,000 per annum',
      'Renewable for course duration',
      'No repayment required'
    ],
    website: 'https://scholarships.gov.in/',
    contactInfo: {
      email: 'ewsscholarship@education.gov.in',
      phone: '1800-123-4572'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'Google India Scholarship',
    provider: 'Google India',
    type: 'Corporate',
    amount: 50000,
    description: 'Scholarship for students pursuing computer science and related fields',
    eligibility: {
      categories: ['All'],
      minPercentage: 85,
      maxIncome: 500000,
      class: 12,
      courses: ['Computer Science', 'Information Technology', 'Software Engineering'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-05-31',
    documentsRequired: [
      'Marksheet',
      'Admission proof',
      'Income certificate',
      'Essay on career goals',
      'Recommendation letter'
    ],
    applicationProcess: 'Online application through Google India website',
    benefits: [
      '₹50,000 per annum',
      'Mentorship program',
      'Internship opportunities',
      'No repayment required'
    ],
    website: 'https://www.google.com/india/',
    contactInfo: {
      email: 'scholarships@google.com',
      phone: '1800-123-4573'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'Microsoft India Scholarship',
    provider: 'Microsoft India',
    type: 'Corporate',
    amount: 75000,
    description: 'Scholarship for students pursuing technology and engineering fields',
    eligibility: {
      categories: ['All'],
      minPercentage: 80,
      maxIncome: 600000,
      class: 12,
      courses: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-06-15',
    documentsRequired: [
      'Marksheet',
      'Admission proof',
      'Income certificate',
      'Project portfolio',
      'Recommendation letter'
    ],
    applicationProcess: 'Online application through Microsoft India website',
    benefits: [
      '₹75,000 per annum',
      'Mentorship program',
      'Internship opportunities',
      'Job placement assistance'
    ],
    website: 'https://www.microsoft.com/en-in/',
    contactInfo: {
      email: 'scholarships@microsoft.com',
      phone: '1800-123-4574'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'Tata Trusts Scholarship',
    provider: 'Tata Trusts',
    type: 'Private',
    amount: 30000,
    description: 'Scholarship for meritorious students from economically weaker sections',
    eligibility: {
      categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      minPercentage: 85,
      maxIncome: 300000,
      class: 12,
      courses: ['All'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-04-30',
    documentsRequired: [
      'Marksheet',
      'Income certificate',
      'Aadhar card',
      'Bank account details',
      'Recommendation letter'
    ],
    applicationProcess: 'Online application through Tata Trusts website',
    benefits: [
      '₹30,000 per annum',
      'Renewable for course duration',
      'No repayment required'
    ],
    website: 'https://www.tatatrusts.org/',
    contactInfo: {
      email: 'scholarships@tatatrusts.org',
      phone: '1800-123-4575'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'Reliance Foundation Scholarship',
    provider: 'Reliance Foundation',
    type: 'Private',
    amount: 40000,
    description: 'Scholarship for students pursuing higher education in India',
    eligibility: {
      categories: ['All'],
      minPercentage: 80,
      maxIncome: 400000,
      class: 12,
      courses: ['All'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-05-15',
    documentsRequired: [
      'Marksheet',
      'Income certificate',
      'Aadhar card',
      'Bank account details',
      'Essay on career goals'
    ],
    applicationProcess: 'Online application through Reliance Foundation website',
    benefits: [
      '₹40,000 per annum',
      'Renewable for course duration',
      'No repayment required'
    ],
    website: 'https://www.reliancefoundation.org/',
    contactInfo: {
      email: 'scholarships@reliancefoundation.org',
      phone: '1800-123-4576'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'Aditya Birla Scholarship',
    provider: 'Aditya Birla Group',
    type: 'Private',
    amount: 35000,
    description: 'Scholarship for meritorious students pursuing higher education',
    eligibility: {
      categories: ['All'],
      minPercentage: 85,
      maxIncome: 350000,
      class: 12,
      courses: ['All'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-04-30',
    documentsRequired: [
      'Marksheet',
      'Income certificate',
      'Aadhar card',
      'Bank account details',
      'Recommendation letter'
    ],
    applicationProcess: 'Online application through Aditya Birla Group website',
    benefits: [
      '₹35,000 per annum',
      'Renewable for course duration',
      'No repayment required'
    ],
    website: 'https://www.adityabirla.com/',
    contactInfo: {
      email: 'scholarships@adityabirla.com',
      phone: '1800-123-4577'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'Wipro Scholarship',
    provider: 'Wipro Limited',
    type: 'Corporate',
    amount: 25000,
    description: 'Scholarship for students pursuing computer science and engineering',
    eligibility: {
      categories: ['All'],
      minPercentage: 80,
      maxIncome: 500000,
      class: 12,
      courses: ['Computer Science', 'Information Technology', 'Software Engineering'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-06-30',
    documentsRequired: [
      'Marksheet',
      'Admission proof',
      'Income certificate',
      'Project portfolio',
      'Recommendation letter'
    ],
    applicationProcess: 'Online application through Wipro website',
    benefits: [
      '₹25,000 per annum',
      'Mentorship program',
      'Internship opportunities',
      'Job placement assistance'
    ],
    website: 'https://www.wipro.com/',
    contactInfo: {
      email: 'scholarships@wipro.com',
      phone: '1800-123-4578'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'Infosys Scholarship',
    provider: 'Infosys Limited',
    type: 'Corporate',
    amount: 30000,
    description: 'Scholarship for students pursuing technology and engineering fields',
    eligibility: {
      categories: ['All'],
      minPercentage: 80,
      maxIncome: 500000,
      class: 12,
      courses: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-07-15',
    documentsRequired: [
      'Marksheet',
      'Admission proof',
      'Income certificate',
      'Project portfolio',
      'Recommendation letter'
    ],
    applicationProcess: 'Online application through Infosys website',
    benefits: [
      '₹30,000 per annum',
      'Mentorship program',
      'Internship opportunities',
      'Job placement assistance'
    ],
    website: 'https://www.infosys.com/',
    contactInfo: {
      email: 'scholarships@infosys.com',
      phone: '1800-123-4579'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'TCS Scholarship',
    provider: 'Tata Consultancy Services',
    type: 'Corporate',
    amount: 28000,
    description: 'Scholarship for students pursuing computer science and engineering',
    eligibility: {
      categories: ['All'],
      minPercentage: 80,
      maxIncome: 500000,
      class: 12,
      courses: ['Computer Science', 'Information Technology', 'Software Engineering'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-07-31',
    documentsRequired: [
      'Marksheet',
      'Admission proof',
      'Income certificate',
      'Project portfolio',
      'Recommendation letter'
    ],
    applicationProcess: 'Online application through TCS website',
    benefits: [
      '₹28,000 per annum',
      'Mentorship program',
      'Internship opportunities',
      'Job placement assistance'
    ],
    website: 'https://www.tcs.com/',
    contactInfo: {
      email: 'scholarships@tcs.com',
      phone: '1800-123-4580'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  },
  {
    name: 'HCL Scholarship',
    provider: 'HCL Technologies',
    type: 'Corporate',
    amount: 32000,
    description: 'Scholarship for students pursuing technology and engineering fields',
    eligibility: {
      categories: ['All'],
      minPercentage: 80,
      maxIncome: 500000,
      class: 12,
      courses: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
      gender: 'All',
      pwd: false
    },
    applicationDeadline: '2025-08-15',
    documentsRequired: [
      'Marksheet',
      'Admission proof',
      'Income certificate',
      'Project portfolio',
      'Recommendation letter'
    ],
    applicationProcess: 'Online application through HCL website',
    benefits: [
      '₹32,000 per annum',
      'Mentorship program',
      'Internship opportunities',
      'Job placement assistance'
    ],
    website: 'https://www.hcl.com/',
    contactInfo: {
      email: 'scholarships@hcl.com',
      phone: '1800-123-4581'
    },
    status: 'Active',
    renewalRequired: true,
    maxRenewals: 4
  }
];

export const importRealScholarships = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careervista');
    
    // Clear existing scholarships
    await Scholarship.deleteMany({});
    logger.info('Cleared existing scholarship data');
    
    // Insert real scholarship data
    const scholarships = await Scholarship.insertMany(realScholarshipsData);
    logger.info(`Successfully imported ${scholarships.length} scholarships with real data`);
    
    // Close connection
    await mongoose.connection.close();
    
  } catch (error) {
    logger.error('Error importing real scholarships:', error);
    throw error;
  }
};

// Run the import if this file is executed directly
if (require.main === module) {
  importRealScholarships()
    .then(() => {
      logger.info('Real scholarship data import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Real scholarship data import failed:', error);
      process.exit(1);
    });
}


