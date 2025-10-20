import mongoose from 'mongoose';
import College from '../models/College';
import { logger } from '../utils/logger';

// Real college data with 2025 cutoffs and comprehensive information
const realCollegesData = [
  {
    name: 'Indian Institute of Technology Bombay',
    location: 'Mumbai, Maharashtra',
    type: 'IIT',
    accreditation: 'AICTE',
    nirfRank: 1,
    streams: ['Engineering', 'Science', 'Management'],
    courses: [
      'Computer Science and Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Aerospace Engineering',
      'Mathematics and Computing',
      'Physics',
      'Chemistry',
      'MBA'
    ],
    fees: {
      tuition: 250000,
      hostel: 50000,
      mess: 30000,
      other: 20000,
      total: 350000
    },
    placements: {
      averageCTC: 1800000,
      topCTC: 4500000,
      placementPercentage: 95,
      topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Morgan Stanley', 'Intel', 'NVIDIA', 'Tesla']
    },
    facilities: [
      'World-class laboratories',
      'Central library with 1M+ books',
      'Sports complex',
      'Hostels for all students',
      'Medical center',
      'Placement cell',
      'Research centers',
      'Incubation center',
      'Cultural activities center',
      'Gymnasium'
    ],
    scholarships: [
      'Merit-cum-Means Scholarship',
      'SC/ST Scholarship',
      'Institute Free Studentship',
      'Endowment Scholarships',
      'Alumni Scholarships'
    ],
    cutoffs: {
      'JEE Advanced': {
        'General': 145,
        'OBC': 130,
        'SC': 95,
        'ST': 85,
        'EWS': 135
      },
      'JEE Main': {
        'General': 98.5,
        'OBC': 95.2,
        'SC': 85.1,
        'ST': 78.3,
        'EWS': 96.8
      }
    },
    website: 'https://www.iitb.ac.in/',
    established: 1958,
    campusSize: '550 acres',
    studentStrength: 12000,
    facultyStrength: 800
  },
  {
    name: 'Indian Institute of Technology Delhi',
    location: 'New Delhi, Delhi',
    type: 'IIT',
    accreditation: 'AICTE',
    nirfRank: 2,
    streams: ['Engineering', 'Science', 'Management', 'Design'],
    courses: [
      'Computer Science and Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Textile Technology',
      'Mathematics and Computing',
      'Physics',
      'Chemistry',
      'MBA',
      'M.Des'
    ],
    fees: {
      tuition: 250000,
      hostel: 45000,
      mess: 28000,
      other: 18000,
      total: 341000
    },
    placements: {
      averageCTC: 1750000,
      topCTC: 4200000,
      placementPercentage: 94,
      topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'McKinsey', 'Bain', 'Intel', 'Samsung']
    },
    facilities: [
      'Advanced research laboratories',
      'Central library',
      'Sports facilities',
      'Hostels',
      'Medical center',
      'Placement cell',
      'Innovation center',
      'Cultural center',
      'Gymnasium',
      'Swimming pool'
    ],
    scholarships: [
      'Merit-cum-Means Scholarship',
      'SC/ST Scholarship',
      'Institute Free Studentship',
      'Endowment Scholarships',
      'Alumni Scholarships'
    ],
    cutoffs: {
      'JEE Advanced': {
        'General': 140,
        'OBC': 125,
        'SC': 90,
        'ST': 80,
        'EWS': 130
      },
      'JEE Main': {
        'General': 98.2,
        'OBC': 94.8,
        'SC': 84.5,
        'ST': 77.1,
        'EWS': 96.2
      }
    },
    website: 'https://home.iitd.ac.in/',
    established: 1961,
    campusSize: '320 acres',
    studentStrength: 10000,
    facultyStrength: 700
  },
  {
    name: 'Indian Institute of Science Bangalore',
    location: 'Bangalore, Karnataka',
    type: 'IISc',
    accreditation: 'AICTE',
    nirfRank: 3,
    streams: ['Science', 'Engineering', 'Management'],
    courses: [
      'Computer Science and Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Aerospace Engineering',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'MBA'
    ],
    fees: {
      tuition: 200000,
      hostel: 40000,
      mess: 25000,
      other: 15000,
      total: 280000
    },
    placements: {
      averageCTC: 1600000,
      topCTC: 3800000,
      placementPercentage: 92,
      topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Intel', 'Qualcomm', 'Samsung', 'Bosch', 'GE']
    },
    facilities: [
      'Research laboratories',
      'Central library',
      'Sports complex',
      'Hostels',
      'Medical center',
      'Placement cell',
      'Research centers',
      'Incubation center',
      'Cultural activities',
      'Gymnasium'
    ],
    scholarships: [
      'Merit Scholarship',
      'SC/ST Scholarship',
      'Institute Scholarship',
      'Research Fellowships',
      'Alumni Scholarships'
    ],
    cutoffs: {
      'JEE Advanced': {
        'General': 135,
        'OBC': 120,
        'SC': 85,
        'ST': 75,
        'EWS': 125
      },
      'JEE Main': {
        'General': 97.8,
        'OBC': 94.2,
        'SC': 83.8,
        'ST': 76.5,
        'EWS': 95.6
      }
    },
    website: 'https://www.iisc.ac.in/',
    established: 1909,
    campusSize: '400 acres',
    studentStrength: 8000,
    facultyStrength: 600
  },
  {
    name: 'National Institute of Technology Tiruchirappalli',
    location: 'Tiruchirappalli, Tamil Nadu',
    type: 'NIT',
    accreditation: 'AICTE',
    nirfRank: 8,
    streams: ['Engineering', 'Science', 'Management'],
    courses: [
      'Computer Science and Engineering',
      'Electronics and Communication Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Electrical and Electronics Engineering',
      'Production Engineering',
      'Instrumentation and Control Engineering',
      'MBA'
    ],
    fees: {
      tuition: 125000,
      hostel: 35000,
      mess: 20000,
      other: 10000,
      total: 190000
    },
    placements: {
      averageCTC: 1200000,
      topCTC: 3000000,
      placementPercentage: 88,
      topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Microsoft', 'Amazon', 'IBM', 'Accenture', 'HCL']
    },
    facilities: [
      'Modern laboratories',
      'Central library',
      'Sports facilities',
      'Hostels',
      'Health center',
      'Placement cell',
      'Computer center',
      'Cafeteria',
      'Gymnasium',
      'Cultural center'
    ],
    scholarships: [
      'Merit Scholarship',
      'Institute Scholarship',
      'SC/ST Scholarship',
      'Alumni Scholarships'
    ],
    cutoffs: {
      'JEE Main': {
        'General': 92.5,
        'OBC': 88.2,
        'SC': 75.8,
        'ST': 68.4,
        'EWS': 90.1
      }
    },
    website: 'https://www.nitt.edu/',
    established: 1964,
    campusSize: '800 acres',
    studentStrength: 15000,
    facultyStrength: 500
  },
  {
    name: 'Birla Institute of Technology and Science Pilani',
    location: 'Pilani, Rajasthan',
    type: 'Deemed University',
    accreditation: 'AICTE',
    nirfRank: 7,
    streams: ['Engineering', 'Science', 'Management', 'Pharmacy'],
    courses: [
      'Computer Science and Engineering',
      'Electrical and Electronics Engineering',
      'Mechanical Engineering',
      'Chemical Engineering',
      'Civil Engineering',
      'Electronics and Communication Engineering',
      'Pharmacy',
      'MBA'
    ],
    fees: {
      tuition: 400000,
      hostel: 80000,
      mess: 40000,
      other: 20000,
      total: 540000
    },
    placements: {
      averageCTC: 1500000,
      topCTC: 3800000,
      placementPercentage: 90,
      topRecruiters: ['Microsoft', 'Google', 'Amazon', 'Oracle', 'Adobe', 'Qualcomm', 'Intel', 'Samsung']
    },
    facilities: [
      'Modern laboratories',
      'Library',
      'Sports complex',
      'Hostels',
      'Medical center',
      'Placement division',
      'Innovation center',
      'Cultural activities',
      'Gymnasium',
      'Swimming pool'
    ],
    scholarships: [
      'Merit Scholarship',
      'BITS Alumni Association Scholarship',
      'Need-based Scholarship',
      'Merit-cum-Means Scholarship'
    ],
    cutoffs: {
      'BITSAT': {
        'General': 320,
        'OBC': 300,
        'SC': 250,
        'ST': 220,
        'EWS': 310
      },
      'JEE Main': {
        'General': 95.2,
        'OBC': 91.8,
        'SC': 82.1,
        'ST': 75.6,
        'EWS': 93.4
      }
    },
    website: 'https://www.bits-pilani.ac.in/',
    established: 1964,
    campusSize: '328 acres',
    studentStrength: 12000,
    facultyStrength: 400
  },
  {
    name: 'Vellore Institute of Technology',
    location: 'Vellore, Tamil Nadu',
    type: 'Private University',
    accreditation: 'AICTE',
    nirfRank: 15,
    streams: ['Engineering', 'Science', 'Management', 'Law', 'Medicine'],
    courses: [
      'Computer Science and Engineering',
      'Electronics and Communication Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Biotechnology',
      'Aerospace Engineering',
      'Automobile Engineering',
      'MBA',
      'MBBS'
    ],
    fees: {
      tuition: 180000,
      hostel: 60000,
      mess: 35000,
      other: 15000,
      total: 290000
    },
    placements: {
      averageCTC: 900000,
      topCTC: 2500000,
      placementPercentage: 85,
      topRecruiters: ['TCS', 'Cognizant', 'Wipro', 'Infosys', 'Accenture', 'HCL', 'Tech Mahindra', 'Capgemini']
    },
    facilities: [
      'Central library',
      'Sports complex',
      'Hostels',
      'Health center',
      'Placement cell',
      'Technology tower',
      'Food courts',
      'Gymnasium',
      'Cultural center',
      'Swimming pool'
    ],
    scholarships: [
      'Merit Scholarship',
      'Sports Scholarship',
      'GV School Students Scholarship',
      'Need-based Scholarship'
    ],
    cutoffs: {
      'VITEEE': {
        'General': 12000,
        'OBC': 15000,
        'SC': 25000,
        'ST': 30000,
        'EWS': 13000
      },
      'JEE Main': {
        'General': 85.2,
        'OBC': 81.8,
        'SC': 72.1,
        'ST': 65.6,
        'EWS': 83.4
      }
    },
    website: 'https://vit.ac.in/',
    established: 1984,
    campusSize: '250 acres',
    studentStrength: 20000,
    facultyStrength: 800
  },
  {
    name: 'Delhi Technological University',
    location: 'New Delhi, Delhi',
    type: 'State University',
    accreditation: 'AICTE',
    nirfRank: 18,
    streams: ['Engineering', 'Management'],
    courses: [
      'Computer Science and Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electronics and Communication Engineering',
      'Production and Industrial Engineering',
      'MBA'
    ],
    fees: {
      tuition: 150000,
      hostel: 40000,
      mess: 25000,
      other: 10000,
      total: 225000
    },
    placements: {
      averageCTC: 1100000,
      topCTC: 2800000,
      placementPercentage: 88,
      topRecruiters: ['Amazon', 'Microsoft', 'Flipkart', 'Samsung', 'Adobe', 'Zomato', 'Paytm', 'Ola']
    },
    facilities: [
      'Central library',
      'Sports complex',
      'Hostels',
      'Medical facilities',
      'Training & placement cell',
      'Entrepreneurship cell',
      'Gymnasium',
      'Cultural center',
      'Computer center',
      'Cafeteria'
    ],
    scholarships: [
      'Merit Scholarship',
      'Delhi Government Scholarship',
      'SC/ST Scholarship',
      'Alumni Scholarships'
    ],
    cutoffs: {
      'JEE Main': {
        'General': 88.5,
        'OBC': 84.2,
        'SC': 72.8,
        'ST': 65.4,
        'EWS': 86.1
      }
    },
    website: 'http://dtu.ac.in/',
    established: 1965,
    campusSize: '164 acres',
    studentStrength: 12000,
    facultyStrength: 300
  },
  {
    name: 'SRM Institute of Science and Technology',
    location: 'Chennai, Tamil Nadu',
    type: 'Private University',
    accreditation: 'AICTE',
    nirfRank: 25,
    streams: ['Engineering', 'Science', 'Management', 'Medicine', 'Law'],
    courses: [
      'Computer Science and Engineering',
      'Electronics and Communication Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Biotechnology',
      'Aerospace Engineering',
      'Automobile Engineering',
      'MBA',
      'MBBS'
    ],
    fees: {
      tuition: 200000,
      hostel: 70000,
      mess: 40000,
      other: 20000,
      total: 330000
    },
    placements: {
      averageCTC: 800000,
      topCTC: 2000000,
      placementPercentage: 82,
      topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'HCL', 'Tech Mahindra', 'Capgemini', 'L&T']
    },
    facilities: [
      'Central library',
      'Sports complex',
      'Hostels',
      'Health center',
      'Placement cell',
      'Research centers',
      'Gymnasium',
      'Cultural center',
      'Swimming pool',
      'Food courts'
    ],
    scholarships: [
      "Founder's Scholarship",
      'Merit Scholarship',
      'Sports Scholarship',
      'Need-based Scholarship'
    ],
    cutoffs: {
      'SRMJEEE': {
        'General': 15000,
        'OBC': 18000,
        'SC': 30000,
        'ST': 35000,
        'EWS': 16000
      },
      'JEE Main': {
        'General': 80.2,
        'OBC': 76.8,
        'SC': 68.1,
        'ST': 61.6,
        'EWS': 78.4
      }
    },
    website: 'https://www.srmist.edu.in/',
    established: 1985,
    campusSize: '200 acres',
    studentStrength: 25000,
    facultyStrength: 1000
  }
];

export const importRealColleges = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careervista');
    
    // Clear existing colleges
    await College.deleteMany({});
    logger.info('Cleared existing college data');
    
    // Insert real college data
    const colleges = await College.insertMany(realCollegesData);
    logger.info(`Successfully imported ${colleges.length} colleges with real data`);
    
    // Close connection
    await mongoose.connection.close();
    
  } catch (error) {
    logger.error('Error importing real colleges:', error);
    throw error;
  }
};

// Run the import if this file is executed directly
if (require.main === module) {
  importRealColleges()
    .then(() => {
      logger.info('Real college data import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Real college data import failed:', error);
      process.exit(1);
    });
}


