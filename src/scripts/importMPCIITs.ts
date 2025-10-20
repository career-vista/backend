import mongoose from 'mongoose';
import College from '../models/College';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

// MPC Stream - ALL 22 IITs (JEE Advanced)
const allIITs = [
  {
    name: "IIT Bombay",
    location: "Mumbai, Maharashtra",
    state: "Maharashtra",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 68, closing_rank_max: 68},
      {name: "ECE", closing_rank_min: 250, closing_rank_max: 450},
      {name: "EEE", closing_rank_min: 700, closing_rank_max: 1250},
      {name: "MECH", closing_rank_min: 1500, closing_rank_max: 3500},
      {name: "CIVIL", closing_rank_min: 3000, closing_rank_max: 7500},
      {name: "CHEMICAL", closing_rank_min: 1000, closing_rank_max: 4500}
    ],
    average_placement_lpa: 23,
    tuition_fees_total_lakhs: 10
  },
  {
    name: "IIT Madras",
    location: "Chennai, Tamil Nadu",
    state: "Tamil Nadu",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 82, closing_rank_max: 150},
      {name: "ECE", closing_rank_min: 300, closing_rank_max: 700},
      {name: "EEE", closing_rank_min: 800, closing_rank_max: 1700},
      {name: "MECH", closing_rank_min: 2500, closing_rank_max: 4800},
      {name: "CIVIL", closing_rank_min: 4000, closing_rank_max: 6000},
      {name: "CHEMICAL", closing_rank_min: 3000, closing_rank_max: 4400}
    ],
    average_placement_lpa: 23,
    tuition_fees_total_lakhs: 9
  },
  {
    name: "IIT Delhi",
    location: "New Delhi, Delhi",
    state: "Delhi",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 116, closing_rank_max: 116},
      {name: "ECE", closing_rank_min: 300, closing_rank_max: 600},
      {name: "EEE", closing_rank_min: 700, closing_rank_max: 1400},
      {name: "MECH", closing_rank_min: 1800, closing_rank_max: 4500},
      {name: "CIVIL", closing_rank_min: 3000, closing_rank_max: 7000},
      {name: "CHEMICAL", closing_rank_min: 1500, closing_rank_max: 4500}
    ],
    average_placement_lpa: 23,
    tuition_fees_total_lakhs: 9
  },
  {
    name: "IIT Kanpur",
    location: "Kanpur, Uttar Pradesh",
    state: "Uttar Pradesh",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 120, closing_rank_max: 300},
      {name: "ECE", closing_rank_min: 300, closing_rank_max: 700},
      {name: "EEE", closing_rank_min: 600, closing_rank_max: 1200},
      {name: "MECH", closing_rank_min: 1700, closing_rank_max: 4500},
      {name: "CIVIL", closing_rank_min: 3500, closing_rank_max: 7000},
      {name: "CHEMICAL", closing_rank_min: 1800, closing_rank_max: 4500}
    ],
    average_placement_lpa: 19,
    tuition_fees_total_lakhs: 9
  },
  {
    name: "IIT Kharagpur",
    location: "Kharagpur, West Bengal",
    state: "West Bengal",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 200, closing_rank_max: 500},
      {name: "ECE", closing_rank_min: 600, closing_rank_max: 1300},
      {name: "EEE", closing_rank_min: 1000, closing_rank_max: 2500},
      {name: "MECH", closing_rank_min: 2500, closing_rank_max: 5000},
      {name: "CIVIL", closing_rank_min: 5000, closing_rank_max: 12000},
      {name: "CHEMICAL", closing_rank_min: 2500, closing_rank_max: 4500}
    ],
    average_placement_lpa: 16,
    tuition_fees_total_lakhs: 8
  },
  {
    name: "IIT Roorkee",
    location: "Roorkee, Uttarakhand",
    state: "Uttarakhand",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 150, closing_rank_max: 400},
      {name: "ECE", closing_rank_min: 500, closing_rank_max: 1200},
      {name: "EEE", closing_rank_min: 1000, closing_rank_max: 2500},
      {name: "MECH", closing_rank_min: 2500, closing_rank_max: 5000},
      {name: "CIVIL", closing_rank_min: 5000, closing_rank_max: 10000},
      {name: "CHEMICAL", closing_rank_min: 2000, closing_rank_max: 4500}
    ],
    average_placement_lpa: 15,
    tuition_fees_total_lakhs: 8
  },
  {
    name: "IIT Guwahati",
    location: "Guwahati, Assam",
    state: "Assam",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 500, closing_rank_max: 1200},
      {name: "ECE", closing_rank_min: 1000, closing_rank_max: 2500},
      {name: "EEE", closing_rank_min: 2000, closing_rank_max: 4500},
      {name: "MECH", closing_rank_min: 3500, closing_rank_max: 7000},
      {name: "CIVIL", closing_rank_min: 7000, closing_rank_max: 13000},
      {name: "CHEMICAL", closing_rank_min: 3000, closing_rank_max: 6500}
    ],
    average_placement_lpa: 13,
    tuition_fees_total_lakhs: 8
  },
  {
    name: "IIT (BHU) Varanasi",
    location: "Varanasi, Uttar Pradesh",
    state: "Uttar Pradesh",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 1200, closing_rank_max: 1900},
      {name: "ECE", closing_rank_min: 2000, closing_rank_max: 3200},
      {name: "EEE", closing_rank_min: 2200, closing_rank_max: 3800},
      {name: "MECH", closing_rank_min: 4500, closing_rank_max: 8000},
      {name: "CIVIL", closing_rank_min: 6000, closing_rank_max: 11000},
      {name: "CHEMICAL", closing_rank_min: 4500, closing_rank_max: 7000}
    ],
    average_placement_lpa: 16,
    tuition_fees_total_lakhs: 8
  },
  {
    name: "IIT Indore",
    location: "Indore, Madhya Pradesh",
    state: "Madhya Pradesh",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 1200, closing_rank_max: 2500},
      {name: "ECE", closing_rank_min: 2500, closing_rank_max: 4500},
      {name: "EEE", closing_rank_min: 3500, closing_rank_max: 6000},
      {name: "MECH", closing_rank_min: 6000, closing_rank_max: 10000},
      {name: "CIVIL", closing_rank_min: 8000, closing_rank_max: 13000},
      {name: "CHEMICAL", closing_rank_min: 7000, closing_rank_max: 11000}
    ],
    average_placement_lpa: 16,
    tuition_fees_total_lakhs: 8
  },
  {
    name: "IIT Dhanbad (ISM)",
    location: "Dhanbad, Jharkhand",
    state: "Jharkhand",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 2200, closing_rank_max: 3500},
      {name: "ECE", closing_rank_min: 3500, closing_rank_max: 6000},
      {name: "EEE", closing_rank_min: 4500, closing_rank_max: 8000},
      {name: "MECH", closing_rank_min: 8000, closing_rank_max: 12000},
      {name: "CIVIL", closing_rank_min: 10000, closing_rank_max: 14000},
      {name: "CHEMICAL", closing_rank_min: 9000, closing_rank_max: 13000}
    ],
    average_placement_lpa: 14,
    tuition_fees_total_lakhs: 8
  },
  {
    name: "IIT Ropar",
    location: "Ropar, Punjab",
    state: "Punjab",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 2500, closing_rank_max: 4000},
      {name: "ECE", closing_rank_min: 4000, closing_rank_max: 7000},
      {name: "EEE", closing_rank_min: 5000, closing_rank_max: 9000},
      {name: "MECH", closing_rank_min: 9000, closing_rank_max: 14000},
      {name: "CIVIL", closing_rank_min: 11000, closing_rank_max: 16000},
      {name: "CHEMICAL", closing_rank_min: 10000, closing_rank_max: 14000}
    ],
    average_placement_lpa: 13,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIT Gandhinagar",
    location: "Gandhinagar, Gujarat",
    state: "Gujarat",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 3000, closing_rank_max: 5000},
      {name: "ECE", closing_rank_min: 5000, closing_rank_max: 8000},
      {name: "EEE", closing_rank_min: 6000, closing_rank_max: 10000},
      {name: "MECH", closing_rank_min: 10000, closing_rank_max: 15000},
      {name: "CIVIL", closing_rank_min: 12000, closing_rank_max: 17000},
      {name: "CHEMICAL", closing_rank_min: 11000, closing_rank_max: 15000}
    ],
    average_placement_lpa: 13,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIT Jodhpur",
    location: "Jodhpur, Rajasthan",
    state: "Rajasthan",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 3200, closing_rank_max: 6000},
      {name: "ECE", closing_rank_min: 6000, closing_rank_max: 10000},
      {name: "EEE", closing_rank_min: 7000, closing_rank_max: 11000},
      {name: "MECH", closing_rank_min: 11000, closing_rank_max: 16000},
      {name: "CIVIL", closing_rank_min: 13000, closing_rank_max: 18000},
      {name: "CHEMICAL", closing_rank_min: 12000, closing_rank_max: 16000}
    ],
    average_placement_lpa: 12,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIT Patna",
    location: "Patna, Bihar",
    state: "Bihar",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 3500, closing_rank_max: 6000},
      {name: "ECE", closing_rank_min: 6000, closing_rank_max: 9500},
      {name: "EEE", closing_rank_min: 7500, closing_rank_max: 11000},
      {name: "MECH", closing_rank_min: 11000, closing_rank_max: 16000},
      {name: "CIVIL", closing_rank_min: 13000, closing_rank_max: 18000},
      {name: "CHEMICAL", closing_rank_min: 12000, closing_rank_max: 17000}
    ],
    average_placement_lpa: 12,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIT Bhubaneswar",
    location: "Bhubaneswar, Odisha",
    state: "Odisha",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 3800, closing_rank_max: 6500},
      {name: "ECE", closing_rank_min: 6500, closing_rank_max: 10000},
      {name: "EEE", closing_rank_min: 8000, closing_rank_max: 12000},
      {name: "MECH", closing_rank_min: 12000, closing_rank_max: 17000},
      {name: "CIVIL", closing_rank_min: 14000, closing_rank_max: 19000},
      {name: "CHEMICAL", closing_rank_min: 13000, closing_rank_max: 18000}
    ],
    average_placement_lpa: 11,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIT Mandi",
    location: "Mandi, Himachal Pradesh",
    state: "Himachal Pradesh",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 4000, closing_rank_max: 6800},
      {name: "ECE", closing_rank_min: 7000, closing_rank_max: 11000},
      {name: "EEE", closing_rank_min: 9000, closing_rank_max: 13000},
      {name: "MECH", closing_rank_min: 12000, closing_rank_max: 17000},
      {name: "CIVIL", closing_rank_min: 14000, closing_rank_max: 20000},
      {name: "CHEMICAL", closing_rank_min: 13000, closing_rank_max: 18500}
    ],
    average_placement_lpa: 11,
    tuition_fees_total_lakhs: 7
  },
  {
    name: "IIT Palakkad",
    location: "Palakkad, Kerala",
    state: "Kerala",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 5000, closing_rank_max: 8000},
      {name: "ECE", closing_rank_min: 8500, closing_rank_max: 12000},
      {name: "EEE", closing_rank_min: 10000, closing_rank_max: 14000},
      {name: "MECH", closing_rank_min: 13000, closing_rank_max: 18000},
      {name: "CIVIL", closing_rank_min: 15000, closing_rank_max: 20000},
      {name: "CHEMICAL", closing_rank_min: 14000, closing_rank_max: 18500}
    ],
    average_placement_lpa: 10,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "IIT Tirupati",
    location: "Tirupati, Andhra Pradesh",
    state: "Andhra Pradesh",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 5200, closing_rank_max: 8500},
      {name: "ECE", closing_rank_min: 9000, closing_rank_max: 13000},
      {name: "EEE", closing_rank_min: 11000, closing_rank_max: 15000},
      {name: "MECH", closing_rank_min: 14000, closing_rank_max: 18500},
      {name: "CIVIL", closing_rank_min: 16000, closing_rank_max: 20000},
      {name: "CHEMICAL", closing_rank_min: 15000, closing_rank_max: 19000}
    ],
    average_placement_lpa: 10,
    tuition_fees_total_lakhs: 6
  },
  {
    name: "IIT Goa",
    location: "Goa",
    state: "Goa",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 5500, closing_rank_max: 9000},
      {name: "ECE", closing_rank_min: 9500, closing_rank_max: 13500},
      {name: "EEE", closing_rank_min: 11500, closing_rank_max: 15500},
      {name: "MECH", closing_rank_min: 14500, closing_rank_max: 19000},
      {name: "CIVIL", closing_rank_min: 16500, closing_rank_max: 21000},
      {name: "CHEMICAL", closing_rank_min: 15500, closing_rank_max: 19500}
    ],
    average_placement_lpa: 10,
    tuition_fees_total_lakhs: 6
  },
  {
    name: "IIT Bhilai",
    location: "Bhilai, Chhattisgarh",
    state: "Chhattisgarh",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 6500, closing_rank_max: 10500},
      {name: "ECE", closing_rank_min: 11000, closing_rank_max: 15000},
      {name: "EEE", closing_rank_min: 13000, closing_rank_max: 17000},
      {name: "MECH", closing_rank_min: 16000, closing_rank_max: 20000},
      {name: "CIVIL", closing_rank_min: 18000, closing_rank_max: 22000},
      {name: "CHEMICAL", closing_rank_min: 17000, closing_rank_max: 21000}
    ],
    average_placement_lpa: 9,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "IIT Dharwad",
    location: "Dharwad, Karnataka",
    state: "Karnataka",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 6000, closing_rank_max: 9500},
      {name: "ECE", closing_rank_min: 10000, closing_rank_max: 14000},
      {name: "EEE", closing_rank_min: 12000, closing_rank_max: 16000},
      {name: "MECH", closing_rank_min: 15000, closing_rank_max: 19500},
      {name: "CIVIL", closing_rank_min: 17000, closing_rank_max: 21000},
      {name: "CHEMICAL", closing_rank_min: 16000, closing_rank_max: 20000}
    ],
    average_placement_lpa: 9,
    tuition_fees_total_lakhs: 6
  },
  {
    name: "IIT Jammu",
    location: "Jammu, Jammu & Kashmir",
    state: "Jammu & Kashmir",
    type: "government",
    collegeType: "IIT",
    stream: "MPC",
    exam_accepted: "JEE Advanced",
    branches: [
      {name: "CSE", closing_rank_min: 6200, closing_rank_max: 10000},
      {name: "ECE", closing_rank_min: 10500, closing_rank_max: 14500},
      {name: "EEE", closing_rank_min: 12500, closing_rank_max: 16500},
      {name: "MECH", closing_rank_min: 15500, closing_rank_max: 20000},
      {name: "CIVIL", closing_rank_min: 17500, closing_rank_max: 21500},
      {name: "CHEMICAL", closing_rank_min: 16500, closing_rank_max: 20500}
    ],
    average_placement_lpa: 9,
    tuition_fees_total_lakhs: 6
  }
];

async function importMPCIITs() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear only existing IITs from MPC stream
    await College.deleteMany({ 
      stream: "MPC", 
      collegeType: "IIT" 
    });
    logger.info('Cleared existing MPC IIT data');

    // Insert all IIT data
    await College.insertMany(allIITs);
    logger.info(`Imported ${allIITs.length} IITs successfully`);

    console.log('✅ MPC IIT import finished successfully');
    console.log(`📊 Total IITs imported: ${allIITs.length}`);
    console.log(`🎯 Stream: MPC (JEE Advanced)`);
    console.log(`🏛️ College Type: IIT`);

    process.exit(0);

  } catch (error) {
    logger.error('Error importing MPC IITs:', error);
    console.error('❌ Failed to import MPC IITs:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  importMPCIITs();
}

export { importMPCIITs };