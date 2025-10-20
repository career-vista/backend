import mongoose from 'mongoose';
import College from '../models/College';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

// MPC Stream Data (Engineering - JEE Main, JEE Advanced, BITSAT, etc.)
const mpcColleges = [
  // IITs (JEE Advanced)
  {
    name: 'Indian Institute of Technology Bombay',
    location: 'Mumbai, Maharashtra',
    state: 'Maharashtra',
    type: 'government',
    collegeType: 'IIT',
    stream: 'MPC',
    exam_accepted: 'JEE Advanced',
    branches: [
      { name: 'CSE', closing_rank_min: 68, closing_rank_max: 200 },
      { name: 'ECE', closing_rank_min: 350, closing_rank_max: 600 },
      { name: 'EEE', closing_rank_min: 975, closing_rank_max: 1500 },
      { name: 'MECH', closing_rank_min: 2500, closing_rank_max: 4000 },
      { name: 'CIVIL', closing_rank_min: 5250, closing_rank_max: 8000 },
      { name: 'CHEMICAL', closing_rank_min: 2750, closing_rank_max: 4500 }
    ],
    average_placement_lpa: 23,
    tuition_fees_total_lakhs: 12
  },
  {
    name: 'Indian Institute of Technology Delhi',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    type: 'government',
    collegeType: 'IIT',
    stream: 'MPC',
    exam_accepted: 'JEE Advanced',
    branches: [
      { name: 'CSE', closing_rank_min: 116, closing_rank_max: 250 },
      { name: 'ECE', closing_rank_min: 450, closing_rank_max: 800 },
      { name: 'EEE', closing_rank_min: 1050, closing_rank_max: 1800 },
      { name: 'MECH', closing_rank_min: 3150, closing_rank_max: 5000 },
      { name: 'CIVIL', closing_rank_min: 5000, closing_rank_max: 9000 },
      { name: 'CHEMICAL', closing_rank_min: 3000, closing_rank_max: 5500 }
    ],
    average_placement_lpa: 23,
    tuition_fees_total_lakhs: 15
  },
  {
    name: 'Indian Institute of Technology Madras',
    location: 'Chennai, Tamil Nadu',
    state: 'Tamil Nadu',
    type: 'government',
    collegeType: 'IIT',
    stream: 'MPC',
    exam_accepted: 'JEE Advanced',
    branches: [
      { name: 'CSE', closing_rank_min: 82, closing_rank_max: 180 },
      { name: 'ECE', closing_rank_min: 300, closing_rank_max: 700 },
      { name: 'EEE', closing_rank_min: 800, closing_rank_max: 1700 },
      { name: 'MECH', closing_rank_min: 2500, closing_rank_max: 4800 },
      { name: 'CIVIL', closing_rank_min: 4000, closing_rank_max: 6000 },
      { name: 'CHEMICAL', closing_rank_min: 3000, closing_rank_max: 4400 }
    ],
    average_placement_lpa: 23,
    tuition_fees_total_lakhs: 9
  },
  
  // NITs (JEE Main)
  {
    name: 'National Institute of Technology Tiruchirappalli',
    location: 'Tiruchirappalli, Tamil Nadu',
    state: 'Tamil Nadu',
    type: 'government',
    collegeType: 'NIT',
    stream: 'MPC',
    exam_accepted: 'JEE Main',
    branches: [
      { name: 'CSE', closing_rank_min: 1350, closing_rank_max: 2000 },
      { name: 'ECE', closing_rank_min: 2500, closing_rank_max: 4000 },
      { name: 'EEE', closing_rank_min: 4000, closing_rank_max: 6500 },
      { name: 'MECH', closing_rank_min: 7250, closing_rank_max: 12000 },
      { name: 'CIVIL', closing_rank_min: 8500, closing_rank_max: 15000 }
    ],
    average_placement_lpa: 13,
    tuition_fees_total_lakhs: 6
  },
  {
    name: 'National Institute of Technology Surathkal',
    location: 'Surathkal, Karnataka',
    state: 'Karnataka',
    type: 'government',
    collegeType: 'NIT',
    stream: 'MPC',
    exam_accepted: 'JEE Main',
    branches: [
      { name: 'CSE', closing_rank_min: 1500, closing_rank_max: 2200 },
      { name: 'ECE', closing_rank_min: 2850, closing_rank_max: 4500 },
      { name: 'EEE', closing_rank_min: 4500, closing_rank_max: 7000 },
      { name: 'MECH', closing_rank_min: 7750, closing_rank_max: 13000 },
      { name: 'CIVIL', closing_rank_min: 9250, closing_rank_max: 16000 }
    ],
    average_placement_lpa: 12,
    tuition_fees_total_lakhs: 6
  },

  // IIITs
  {
    name: 'International Institute of Information Technology Hyderabad',
    location: 'Hyderabad, Telangana',
    state: 'Telangana',
    type: 'deemed',
    collegeType: 'IIIT',
    stream: 'MPC',
    exam_accepted: 'JEE Main',
    branches: [
      { name: 'CSE', closing_rank_min: 625, closing_rank_max: 1200 },
      { name: 'ECE', closing_rank_min: 1600, closing_rank_max: 2500 }
    ],
    average_placement_lpa: 30,
    tuition_fees_total_lakhs: 30
  }
];

// BiPC Stream Data (Medical - NEET, AIIMS, JIPMER)
const bipcColleges = [
  {
    name: 'All India Institute of Medical Sciences Delhi',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    type: 'government',
    collegeType: 'Medical',
    stream: 'BiPC',
    exam_accepted: 'NEET',
    closing_rank: '1-100',
    fees_per_year: '₹1,300 / year (~₹7,500 total)',
    internship_stipend: '₹26,000–30,000 / month',
    pg_residency: '₹90k–1.2L / month'
  },
  {
    name: 'All India Institute of Medical Sciences Jodhpur',
    location: 'Jodhpur, Rajasthan',
    state: 'Rajasthan',
    type: 'government',
    collegeType: 'Medical',
    stream: 'BiPC',
    exam_accepted: 'NEET',
    closing_rank: '150-1000',
    fees_per_year: '₹5,800 total',
    internship_stipend: '₹23,000–27,000 / month',
    pg_residency: '₹80k–1.1L / month'
  },
  {
    name: 'Maulana Azad Medical College',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    type: 'government',
    collegeType: 'Medical',
    stream: 'BiPC',
    exam_accepted: 'NEET',
    closing_rank: '1200-3000',
    fees_per_year: '₹1,500 / year',
    internship_stipend: '₹18,000–25,000 / month'
  },
  {
    name: 'Armed Forces Medical College',
    location: 'Pune, Maharashtra',
    state: 'Maharashtra',
    type: 'government',
    collegeType: 'Medical',
    stream: 'BiPC',
    exam_accepted: 'NEET',
    closing_rank: '500-2000',
    fees_per_year: 'Free (with bond)',
    internship_stipend: '₹30,000+ / month'
  }
];

// MEC Stream Data (Management, Commerce, Economics - IPMAT, CAT, CUET, etc.)
const mecColleges = [
  {
    name: 'Indian Institute of Management Indore (IPM)',
    location: 'Indore, Madhya Pradesh',
    state: 'Madhya Pradesh',
    type: 'government',
    collegeType: 'Management',
    stream: 'MEC',
    exam_accepted: 'IPMAT',
    closing_percentile: '98-99 percentile',
    average_placement_lpa: 18,
    fees_per_year: '₹3.8 L'
  },
  {
    name: 'Indian Institute of Management Rohtak (IPM)',
    location: 'Rohtak, Haryana',
    state: 'Haryana',
    type: 'government',
    collegeType: 'Management',
    stream: 'MEC',
    exam_accepted: 'IPMAT',
    closing_percentile: '95-97 percentile',
    average_placement_lpa: 16,
    fees_per_year: '₹3.2 L'
  },
  {
    name: 'Shri Ram College of Commerce',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    type: 'government',
    collegeType: 'Management',
    stream: 'MEC',
    exam_accepted: 'CUET',
    closing_percentile: '98+ percentile',
    average_placement_lpa: 12,
    fees_per_year: '₹25,000'
  },
  {
    name: 'Lady Shri Ram College for Women',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    type: 'government',
    collegeType: 'Management',
    stream: 'MEC',
    exam_accepted: 'CUET',
    closing_percentile: '97+ percentile',
    average_placement_lpa: 11,
    fees_per_year: '₹22,000'
  }
];

// CEC Stream Data (Law, Policy, Civics - CLAT, AILET, etc.)
const cecColleges = [
  {
    name: 'National Law School of India University',
    location: 'Bangalore, Karnataka',
    state: 'Karnataka',
    type: 'government',
    collegeType: 'Law',
    stream: 'CEC',
    exam_accepted: 'CLAT',
    closing_rank: '1-50',
    average_placement_lpa: 15,
    fees_per_year: '₹2.8 L'
  },
  {
    name: 'National Law University Delhi',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    type: 'government',
    collegeType: 'Law',
    stream: 'CEC',
    exam_accepted: 'CLAT',
    closing_rank: '50-150',
    average_placement_lpa: 12,
    fees_per_year: '₹1.8 L'
  },
  {
    name: 'Rajiv Gandhi School of Intellectual Property Law',
    location: 'Kharagpur, West Bengal',
    state: 'West Bengal',
    type: 'government',
    collegeType: 'Law',
    stream: 'CEC',
    exam_accepted: 'CLAT',
    closing_rank: '80-200',
    average_placement_lpa: 10,
    fees_per_year: '₹1.5 L'
  },
  {
    name: 'Gujarat National Law University',
    location: 'Gandhinagar, Gujarat',
    state: 'Gujarat',
    type: 'government',
    collegeType: 'Law',
    stream: 'CEC',
    exam_accepted: 'CLAT',
    closing_rank: '100-250',
    average_placement_lpa: 9,
    fees_per_year: '₹1.2 L'
  }
];

// HEC Stream Data (Humanities, Arts, Social Sciences - CUET, DU JAT, etc.)
const hecColleges = [
  {
    name: 'Delhi School of Economics',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    type: 'government',
    collegeType: 'Arts',
    stream: 'HEC',
    exam_accepted: 'CUET',
    closing_percentile: '98+ percentile',
    average_placement_lpa: 8,
    fees_per_year: '₹15,000'
  },
  {
    name: 'Jawaharlal Nehru University',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    type: 'government',
    collegeType: 'Arts',
    stream: 'HEC',
    exam_accepted: 'JNU EE',
    closing_percentile: '95+ percentile',
    average_placement_lpa: 7,
    fees_per_year: '₹5,000'
  },
  {
    name: 'Hindu College',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    type: 'government',
    collegeType: 'Arts',
    stream: 'HEC',
    exam_accepted: 'CUET',
    closing_percentile: '96+ percentile',
    average_placement_lpa: 6,
    fees_per_year: '₹20,000'
  },
  {
    name: 'St. Stephens College',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    type: 'private',
    collegeType: 'Arts',
    stream: 'HEC',
    exam_accepted: 'CUET',
    closing_percentile: '97+ percentile',
    average_placement_lpa: 8,
    fees_per_year: '₹45,000'
  },
  {
    name: 'Banaras Hindu University (Arts)',
    location: 'Varanasi, Uttar Pradesh',
    state: 'Uttar Pradesh',
    type: 'government',
    collegeType: 'Arts',
    stream: 'HEC',
    exam_accepted: 'BHU UET',
    closing_percentile: '90+ percentile',
    average_placement_lpa: 5,
    fees_per_year: '₹8,000'
  }
];

async function importAllStreamColleges() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear existing data
    await College.deleteMany({});
    logger.info('Cleared existing college data');

    const allColleges = [
      ...mpcColleges,
      ...bipcColleges,
      ...mecColleges,
      ...cecColleges,
      ...hecColleges
    ];

    // Insert all data
    await College.insertMany(allColleges);
    logger.info(`Imported ${allColleges.length} colleges successfully`);

    console.log('✅ All stream college data import completed successfully');
    console.log(`📊 Total colleges: ${allColleges.length}`);
    console.log(`🔬 MPC (Engineering): ${mpcColleges.length}`);
    console.log(`🏥 BiPC (Medical): ${bipcColleges.length}`);
    console.log(`💼 MEC (Management): ${mecColleges.length}`);
    console.log(`⚖️ CEC (Law): ${cecColleges.length}`);
    console.log(`📚 HEC (Humanities): ${hecColleges.length}`);

    process.exit(0);

  } catch (error) {
    logger.error('Error importing all stream college data:', error);
    console.error('❌ Failed to import all stream college data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  importAllStreamColleges();
}

export { importAllStreamColleges };