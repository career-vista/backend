import mongoose from 'mongoose';
import College from '../models/College';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

// Helper function to parse rank ranges like "250-1000" 
function parseRankRange(rankString: string): { min: number, max: number } {
  const [min, max] = rankString.split('-').map(num => parseInt(num.trim()));
  return { min, max };
}

// Helper function to parse placement like "28-32 LPA"
function parseAvgPlacement(placementString: string): number {
  const match = placementString.match(/(\d+)-(\d+)/);
  if (match) {
    const [, min, max] = match;
    return (parseInt(min) + parseInt(max)) / 2;
  }
  return 8; // fallback
}

// Helper function to parse tuition like "3.0 L/year (~12 L total)"
function parseTuitionFees(tuitionString: string): number {
  const totalMatch = tuitionString.match(/~(\d+\.?\d*)\s*L\s*total/);
  if (totalMatch) {
    return parseFloat(totalMatch[1]);
  }
  // Fallback to yearly * 4
  const yearlyMatch = tuitionString.match(/(\d+\.?\d*)\s*L\/year/);
  if (yearlyMatch) {
    return parseFloat(yearlyMatch[1]) * 4;
  }
  return 7; // fallback
}

// MPC Stream - ALL 25 IIITs (JEE Main)
const allIIITs = [
  {
    name: "IIIT Hyderabad",
    location: "Hyderabad, Telangana",
    state: "Telangana",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 250, closing_rank_max: 1000},
      {name: "ECE", closing_rank_min: 1000, closing_rank_max: 2200}
    ],
    average_placement_lpa: 30,
    tuition_fees_total_lakhs: 12
  },
  {
    name: "IIIT Bangalore",
    location: "Bangalore, Karnataka",
    state: "Karnataka",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 700, closing_rank_max: 1500},
      {name: "ECE", closing_rank_min: 2000, closing_rank_max: 3500}
    ],
    average_placement_lpa: 26.5,
    tuition_fees_total_lakhs: 14
  },
  {
    name: "IIIT Delhi",
    location: "New Delhi, Delhi",
    state: "Delhi",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 1200, closing_rank_max: 2200},
      {name: "ECE", closing_rank_min: 3000, closing_rank_max: 5000},
      {name: "CS+AI", closing_rank_min: 2500, closing_rank_max: 4500},
      {name: "CS+Bio", closing_rank_min: 2500, closing_rank_max: 4500},
      {name: "IT", closing_rank_min: 2500, closing_rank_max: 4500}
    ],
    average_placement_lpa: 19,
    tuition_fees_total_lakhs: 10
  },
  {
    name: "IIIT Allahabad",
    location: "Allahabad, Uttar Pradesh",
    state: "Uttar Pradesh",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 3500, closing_rank_max: 6000},
      {name: "IT", closing_rank_min: 4000, closing_rank_max: 7500},
      {name: "ECE", closing_rank_min: 6000, closing_rank_max: 9000}
    ],
    average_placement_lpa: 15,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Gwalior",
    location: "Gwalior, Madhya Pradesh",
    state: "Madhya Pradesh",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 6000, closing_rank_max: 8500},
      {name: "IT", closing_rank_min: 6000, closing_rank_max: 8500},
      {name: "ECE", closing_rank_min: 8000, closing_rank_max: 11000}
    ],
    average_placement_lpa: 13,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Jabalpur",
    location: "Jabalpur, Madhya Pradesh",
    state: "Madhya Pradesh",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 7000, closing_rank_max: 10000},
      {name: "ECE", closing_rank_min: 10000, closing_rank_max: 13000}
    ],
    average_placement_lpa: 11,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Kancheepuram",
    location: "Kancheepuram, Tamil Nadu",
    state: "Tamil Nadu",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 6500, closing_rank_max: 9000},
      {name: "ECE", closing_rank_min: 9000, closing_rank_max: 12000}
    ],
    average_placement_lpa: 10,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Kota",
    location: "Kota, Rajasthan",
    state: "Rajasthan",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 12000, closing_rank_max: 15000},
      {name: "ECE", closing_rank_min: 15000, closing_rank_max: 18000}
    ],
    average_placement_lpa: 8.5,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Vadodara",
    location: "Vadodara, Gujarat",
    state: "Gujarat",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 11000, closing_rank_max: 14000},
      {name: "IT", closing_rank_min: 13000, closing_rank_max: 16000}
    ],
    average_placement_lpa: 8.5,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Bhubaneswar",
    location: "Bhubaneswar, Odisha",
    state: "Odisha",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 10000, closing_rank_max: 13000},
      {name: "IT", closing_rank_min: 12000, closing_rank_max: 15000},
      {name: "ECE", closing_rank_min: 14000, closing_rank_max: 17000}
    ],
    average_placement_lpa: 8,
    tuition_fees_total_lakhs: 8
  },
  {
    name: "IIIT Guwahati",
    location: "Guwahati, Assam",
    state: "Assam",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 9500, closing_rank_max: 12000},
      {name: "ECE", closing_rank_min: 12500, closing_rank_max: 15500}
    ],
    average_placement_lpa: 8.5,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Pune",
    location: "Pune, Maharashtra",
    state: "Maharashtra",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 10000, closing_rank_max: 13000},
      {name: "ECE", closing_rank_min: 13000, closing_rank_max: 16000}
    ],
    average_placement_lpa: 8.5,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Nagpur",
    location: "Nagpur, Maharashtra",
    state: "Maharashtra",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 11000, closing_rank_max: 14000},
      {name: "ECE", closing_rank_min: 14500, closing_rank_max: 17500}
    ],
    average_placement_lpa: 7.5,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Kottayam",
    location: "Kottayam, Kerala",
    state: "Kerala",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 12000, closing_rank_max: 15000},
      {name: "ECE", closing_rank_min: 15000, closing_rank_max: 18000}
    ],
    average_placement_lpa: 7.5,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Ranchi",
    location: "Ranchi, Jharkhand",
    state: "Jharkhand",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 12000, closing_rank_max: 15000},
      {name: "ECE", closing_rank_min: 15000, closing_rank_max: 18500}
    ],
    average_placement_lpa: 7.5,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Una",
    location: "Una, Himachal Pradesh",
    state: "Himachal Pradesh",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 11500, closing_rank_max: 14500},
      {name: "ECE", closing_rank_min: 14500, closing_rank_max: 17500},
      {name: "IT", closing_rank_min: 13000, closing_rank_max: 16000}
    ],
    average_placement_lpa: 7.5,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Sonepat",
    location: "Sonepat, Haryana",
    state: "Haryana",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 11000, closing_rank_max: 14000},
      {name: "IT", closing_rank_min: 13000, closing_rank_max: 16000},
      {name: "ECE", closing_rank_min: 14500, closing_rank_max: 18000}
    ],
    average_placement_lpa: 7.5,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Sri City",
    location: "Sri City, Andhra Pradesh",
    state: "Andhra Pradesh",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 10500, closing_rank_max: 13000},
      {name: "ECE", closing_rank_min: 13000, closing_rank_max: 16500}
    ],
    average_placement_lpa: 8.5,
    tuition_fees_total_lakhs: 8
  },
  {
    name: "IIIT Dharwad",
    location: "Dharwad, Karnataka",
    state: "Karnataka",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 12500, closing_rank_max: 15500},
      {name: "ECE", closing_rank_min: 15500, closing_rank_max: 18500}
    ],
    average_placement_lpa: 7,
    tuition_fees_total_lakhs: 8
  },
  {
    name: "IIIT Lucknow",
    location: "Lucknow, Uttar Pradesh",
    state: "Uttar Pradesh",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 8500, closing_rank_max: 11000},
      {name: "IT", closing_rank_min: 10000, closing_rank_max: 13000},
      {name: "AI+DS", closing_rank_min: 11500, closing_rank_max: 14000}
    ],
    average_placement_lpa: 9.5,
    tuition_fees_total_lakhs: 8
  },
  {
    name: "IIIT Bhagalpur",
    location: "Bhagalpur, Bihar",
    state: "Bihar",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 13000, closing_rank_max: 16000},
      {name: "ECE", closing_rank_min: 16000, closing_rank_max: 19000},
      {name: "Mechatronics", closing_rank_min: 17000, closing_rank_max: 20000}
    ],
    average_placement_lpa: 7,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Bhopal",
    location: "Bhopal, Madhya Pradesh",
    state: "Madhya Pradesh",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 11500, closing_rank_max: 14000},
      {name: "IT", closing_rank_min: 13000, closing_rank_max: 16000},
      {name: "ECE", closing_rank_min: 15000, closing_rank_max: 18000}
    ],
    average_placement_lpa: 7.5,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Kalyani",
    location: "Kalyani, West Bengal",
    state: "West Bengal",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 12500, closing_rank_max: 15500},
      {name: "IT", closing_rank_min: 14000, closing_rank_max: 17000},
      {name: "ECE", closing_rank_min: 16000, closing_rank_max: 19000}
    ],
    average_placement_lpa: 7,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Tiruchirappalli",
    location: "Tiruchirappalli, Tamil Nadu",
    state: "Tamil Nadu",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 11500, closing_rank_max: 14000},
      {name: "ECE", closing_rank_min: 14000, closing_rank_max: 17000}
    ],
    average_placement_lpa: 7.5,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIIT Raichur",
    location: "Raichur, Karnataka",
    state: "Karnataka",
    type: "government",
    collegeType: "IIIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 12500, closing_rank_max: 15000},
      {name: "AI+DS", closing_rank_min: 14000, closing_rank_max: 17000}
    ],
    average_placement_lpa: 6.5,
    tuition_fees_total_lakhs: 8
  }
];

async function importMPCIIITs() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear only existing IIITs from MPC stream
    await College.deleteMany({ 
      stream: "MPC", 
      collegeType: "IIIT" 
    });
    logger.info('Cleared existing MPC IIIT data');

    // Insert all IIIT data
    await College.insertMany(allIIITs);
    logger.info(`Imported ${allIIITs.length} IIITs successfully`);

    console.log('✅ MPC IIIT import finished successfully');
    console.log(`📊 Total IIITs imported: ${allIIITs.length}`);
    console.log(`🎯 Stream: MPC (JEE Main)`);
    console.log(`🏛️ College Type: IIIT`);

    process.exit(0);

  } catch (error) {
    logger.error('Error importing MPC IIITs:', error);
    console.error('❌ Failed to import MPC IIITs:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  importMPCIIITs();
}

export { importMPCIIITs };