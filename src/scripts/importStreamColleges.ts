import mongoose from 'mongoose';
import College from '../models/College';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

// IIT Data (MPC Stream - JEE Advanced)
const iitData = [
  {
    "name": "IIT Bombay",
    "location": "Mumbai, Maharashtra",
    "state": "Maharashtra",
    "exam_accepted": "JEE Advanced",
    "branches": [
      {"name": "CSE", "closing_rank_min": 68, "closing_rank_max": 68},
      {"name": "ECE", "closing_rank_min": 250, "closing_rank_max": 450},
      {"name": "EEE", "closing_rank_min": 700, "closing_rank_max": 1250},
      {"name": "MECH", "closing_rank_min": 1500, "closing_rank_max": 3500},
      {"name": "CIVIL", "closing_rank_min": 3000, "closing_rank_max": 7500},
      {"name": "CHEMICAL", "closing_rank_min": 1000, "closing_rank_max": 4500}
    ],
    "average_placement_lpa": 23,
    "tuition_fees_total_lakhs": 10
  },
  {
    "name": "IIT Madras",
    "location": "Chennai, Tamil Nadu",
    "state": "Tamil Nadu",
    "exam_accepted": "JEE Advanced",
    "branches": [
      {"name": "CSE", "closing_rank_min": 82, "closing_rank_max": 150},
      {"name": "ECE", "closing_rank_min": 300, "closing_rank_max": 700},
      {"name": "EEE", "closing_rank_min": 800, "closing_rank_max": 1700},
      {"name": "MECH", "closing_rank_min": 2500, "closing_rank_max": 4800},
      {"name": "CIVIL", "closing_rank_min": 4000, "closing_rank_max": 6000},
      {"name": "CHEMICAL", "closing_rank_min": 3000, "closing_rank_max": 4400}
    ],
    "average_placement_lpa": 23,
    "tuition_fees_total_lakhs": 9
  },
  {
    "name": "IIT Delhi",
    "location": "New Delhi, Delhi",
    "state": "Delhi",
    "exam_accepted": "JEE Advanced",
    "branches": [
      {"name": "CSE", "closing_rank_min": 116, "closing_rank_max": 116},
      {"name": "ECE", "closing_rank_min": 300, "closing_rank_max": 600},
      {"name": "EEE", "closing_rank_min": 700, "closing_rank_max": 1400},
      {"name": "MECH", "closing_rank_min": 1800, "closing_rank_max": 4500},
      {"name": "CIVIL", "closing_rank_min": 3000, "closing_rank_max": 7000},
      {"name": "CHEMICAL", "closing_rank_min": 1500, "closing_rank_max": 4500}
    ],
    "average_placement_lpa": 23,
    "tuition_fees_total_lakhs": 9
  },
  {
    "name": "IIT Kanpur",
    "location": "Kanpur, Uttar Pradesh",
    "state": "Uttar Pradesh",
    "exam_accepted": "JEE Advanced",
    "branches": [
      {"name": "CSE", "closing_rank_min": 120, "closing_rank_max": 300},
      {"name": "ECE", "closing_rank_min": 300, "closing_rank_max": 700},
      {"name": "EEE", "closing_rank_min": 600, "closing_rank_max": 1200},
      {"name": "MECH", "closing_rank_min": 1700, "closing_rank_max": 4500},
      {"name": "CIVIL", "closing_rank_min": 3500, "closing_rank_max": 7000},
      {"name": "CHEMICAL", "closing_rank_min": 1800, "closing_rank_max": 4500}
    ],
    "average_placement_lpa": 19,
    "tuition_fees_total_lakhs": 9
  },
  {
    "name": "IIT Kharagpur",
    "location": "Kharagpur, West Bengal",
    "state": "West Bengal",
    "exam_accepted": "JEE Advanced",
    "branches": [
      {"name": "CSE", "closing_rank_min": 200, "closing_rank_max": 500},
      {"name": "ECE", "closing_rank_min": 600, "closing_rank_max": 1300},
      {"name": "EEE", "closing_rank_min": 1000, "closing_rank_max": 2500},
      {"name": "MECH", "closing_rank_min": 2500, "closing_rank_max": 5000},
      {"name": "CIVIL", "closing_rank_min": 5000, "closing_rank_max": 12000},
      {"name": "CHEMICAL", "closing_rank_min": 2500, "closing_rank_max": 4500}
    ],
    "average_placement_lpa": 16,
    "tuition_fees_total_lakhs": 8
  }
  // Add more IITs as needed...
];

// NIT Data (MPC Stream - JEE Main)
const nitData = [
  {
    "name": "NIT Trichy",
    "location": "Tamil Nadu",
    "state": "Tamil Nadu",
    "exam_accepted": "JEE Main",
    "branches": [
      {"name": "CSE", "closing_rank_min": 1100, "closing_rank_max": 1600},
      {"name": "ECE", "closing_rank_min": 2000, "closing_rank_max": 3000},
      {"name": "EEE", "closing_rank_min": 3000, "closing_rank_max": 5000},
      {"name": "MECH", "closing_rank_min": 6000, "closing_rank_max": 8500},
      {"name": "CIVIL", "closing_rank_min": 7000, "closing_rank_max": 10000}
    ],
    "average_placement_lpa": 13,
    "tuition_fees_total_lakhs": 5
  },
  {
    "name": "NIT Surathkal",
    "location": "Karnataka",
    "state": "Karnataka", 
    "exam_accepted": "JEE Main",
    "branches": [
      {"name": "CSE", "closing_rank_min": 1200, "closing_rank_max": 1800},
      {"name": "ECE", "closing_rank_min": 2200, "closing_rank_max": 3500},
      {"name": "EEE", "closing_rank_min": 3500, "closing_rank_max": 5500},
      {"name": "MECH", "closing_rank_min": 6500, "closing_rank_max": 9000},
      {"name": "CIVIL", "closing_rank_min": 7500, "closing_rank_max": 11000}
    ],
    "average_placement_lpa": 12,
    "tuition_fees_total_lakhs": 5
  }
  // Add more NITs as needed...
];

// Medical Colleges Data (BiPC Stream - NEET)
const medicalData = [
  {
    "name": "AIIMS Delhi",
    "location": "Delhi",
    "state": "Delhi",
    "exam_accepted": "NEET",
    "closing_rank": "1-100",
    "fees_per_year": "₹1,300 / year (~₹7,500 total)",
    "internship_stipend": "₹26,000–30,000 / month",
    "pg_residency": "₹90k–1.2L / month"
  },
  {
    "name": "AIIMS Jodhpur",
    "location": "Rajasthan",
    "state": "Rajasthan",
    "exam_accepted": "NEET",
    "closing_rank": "150-1,000",
    "fees_per_year": "₹5,800 total",
    "internship_stipend": "₹23,000–27,000 / month",
    "pg_residency": "₹80k–1.1L / month"
  }
  // Add more medical colleges as needed...
];

// Management Colleges Data (MEC Stream)
const managementData = [
  {
    "name": "IIM Indore (IPM)",
    "location": "Madhya Pradesh",
    "state": "Madhya Pradesh",
    "exam_accepted": "IPMAT",
    "courses": ["Integrated Management Program (BBA + MBA)"],
    "closing_percentile": "98–99 %ile",
    "average_placement_lpa": 25,
    "fees_per_year": "₹4.0 L"
  },
  {
    "name": "IIM Rohtak (IPM)",
    "location": "Haryana", 
    "state": "Haryana",
    "exam_accepted": "IPMAT",
    "courses": ["Integrated Management Program (BBA + MBA)"],
    "closing_percentile": "95–97 %ile",
    "average_placement_lpa": 18,
    "fees_per_year": "₹3.8 L"
  }
  // Add more management colleges as needed...
];

async function importCollegeData() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear existing data
    await College.deleteMany({});
    logger.info('Cleared existing college data');

    const collegeData = [];

    // Process IIT data
    for (const iit of iitData) {
      collegeData.push({
        ...iit,
        type: 'government',
        collegeType: 'IIT',
        stream: 'MPC'
      });
    }

    // Process NIT data  
    for (const nit of nitData) {
      collegeData.push({
        ...nit,
        type: 'government',
        collegeType: 'NIT',
        stream: 'MPC'
      });
    }

    // Process Medical data
    for (const medical of medicalData) {
      collegeData.push({
        ...medical,
        type: 'government',
        collegeType: 'Medical',
        stream: 'BiPC'
      });
    }

    // Process Management data
    for (const management of managementData) {
      collegeData.push({
        ...management,
        type: 'government',
        collegeType: 'Management',
        stream: 'MEC'
      });
    }

    // Insert all data
    await College.insertMany(collegeData);
    logger.info(`Imported ${collegeData.length} colleges successfully`);

    console.log('✅ College data import completed successfully');
    process.exit(0);

  } catch (error) {
    logger.error('Error importing college data:', error);
    console.error('❌ Failed to import college data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  importCollegeData();
}

export { importCollegeData };