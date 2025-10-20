import mongoose from 'mongoose';
import College from '../models/College';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

// MPC Stream - ALL 30 NITs (JEE Main)
const allNITs = [
  {
    name: "NIT Trichy",
    location: "Tiruchirappalli, Tamil Nadu",
    state: "Tamil Nadu",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 1100, closing_rank_max: 1600},
      {name: "ECE", closing_rank_min: 2000, closing_rank_max: 3000},
      {name: "EEE", closing_rank_min: 3000, closing_rank_max: 5000},
      {name: "MECH", closing_rank_min: 6000, closing_rank_max: 8500},
      {name: "CIVIL", closing_rank_min: 7000, closing_rank_max: 10000}
    ],
    average_placement_lpa: 13,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Surathkal",
    location: "Surathkal, Karnataka",
    state: "Karnataka",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 1200, closing_rank_max: 1800},
      {name: "ECE", closing_rank_min: 2200, closing_rank_max: 3500},
      {name: "EEE", closing_rank_min: 3500, closing_rank_max: 5500},
      {name: "MECH", closing_rank_min: 6500, closing_rank_max: 9000},
      {name: "CIVIL", closing_rank_min: 7500, closing_rank_max: 11000}
    ],
    average_placement_lpa: 12,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Warangal",
    location: "Warangal, Telangana",
    state: "Telangana",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 1300, closing_rank_max: 1900},
      {name: "ECE", closing_rank_min: 2500, closing_rank_max: 3800},
      {name: "EEE", closing_rank_min: 3800, closing_rank_max: 6000},
      {name: "MECH", closing_rank_min: 6800, closing_rank_max: 9500},
      {name: "CIVIL", closing_rank_min: 8000, closing_rank_max: 11500}
    ],
    average_placement_lpa: 12,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "MNNIT Allahabad",
    location: "Allahabad, Uttar Pradesh",
    state: "Uttar Pradesh",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 2000, closing_rank_max: 3200},
      {name: "ECE", closing_rank_min: 3500, closing_rank_max: 5000},
      {name: "EEE", closing_rank_min: 4500, closing_rank_max: 6500},
      {name: "MECH", closing_rank_min: 7000, closing_rank_max: 10500},
      {name: "CIVIL", closing_rank_min: 8500, closing_rank_max: 12000}
    ],
    average_placement_lpa: 10,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Rourkela",
    location: "Rourkela, Odisha",
    state: "Odisha",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 2200, closing_rank_max: 3300},
      {name: "ECE", closing_rank_min: 3800, closing_rank_max: 5200},
      {name: "EEE", closing_rank_min: 5000, closing_rank_max: 7000},
      {name: "MECH", closing_rank_min: 7500, closing_rank_max: 11000},
      {name: "CIVIL", closing_rank_min: 9000, closing_rank_max: 12500}
    ],
    average_placement_lpa: 10,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Calicut",
    location: "Kozhikode, Kerala",
    state: "Kerala",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 2500, closing_rank_max: 3800},
      {name: "ECE", closing_rank_min: 4000, closing_rank_max: 5500},
      {name: "EEE", closing_rank_min: 5500, closing_rank_max: 7500},
      {name: "MECH", closing_rank_min: 8000, closing_rank_max: 12000},
      {name: "CIVIL", closing_rank_min: 9500, closing_rank_max: 13500}
    ],
    average_placement_lpa: 9,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "VNIT Nagpur",
    location: "Nagpur, Maharashtra",
    state: "Maharashtra",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 3000, closing_rank_max: 4200},
      {name: "ECE", closing_rank_min: 4500, closing_rank_max: 6500},
      {name: "EEE", closing_rank_min: 6000, closing_rank_max: 8500},
      {name: "MECH", closing_rank_min: 8500, closing_rank_max: 12500},
      {name: "CIVIL", closing_rank_min: 10000, closing_rank_max: 14000}
    ],
    average_placement_lpa: 9,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Durgapur",
    location: "Durgapur, West Bengal",
    state: "West Bengal",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 6000, closing_rank_max: 7800},
      {name: "ECE", closing_rank_min: 8000, closing_rank_max: 10500},
      {name: "EEE", closing_rank_min: 9000, closing_rank_max: 12000},
      {name: "MECH", closing_rank_min: 12000, closing_rank_max: 15500},
      {name: "CIVIL", closing_rank_min: 13000, closing_rank_max: 17000}
    ],
    average_placement_lpa: 8,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Kurukshetra",
    location: "Kurukshetra, Haryana",
    state: "Haryana",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 5500, closing_rank_max: 7500},
      {name: "ECE", closing_rank_min: 7500, closing_rank_max: 10000},
      {name: "EEE", closing_rank_min: 8500, closing_rank_max: 12000},
      {name: "MECH", closing_rank_min: 11500, closing_rank_max: 15000},
      {name: "CIVIL", closing_rank_min: 12500, closing_rank_max: 16000}
    ],
    average_placement_lpa: 8,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Silchar",
    location: "Silchar, Assam",
    state: "Assam",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 7500, closing_rank_max: 9500},
      {name: "ECE", closing_rank_min: 9500, closing_rank_max: 12000},
      {name: "EEE", closing_rank_min: 11000, closing_rank_max: 14000},
      {name: "MECH", closing_rank_min: 13000, closing_rank_max: 17000},
      {name: "CIVIL", closing_rank_min: 14500, closing_rank_max: 18500}
    ],
    average_placement_lpa: 7,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "MNIT Jaipur",
    location: "Jaipur, Rajasthan",
    state: "Rajasthan",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 3500, closing_rank_max: 5000},
      {name: "ECE", closing_rank_min: 5500, closing_rank_max: 7500},
      {name: "EEE", closing_rank_min: 6500, closing_rank_max: 9500},
      {name: "MECH", closing_rank_min: 9500, closing_rank_max: 13500},
      {name: "CIVIL", closing_rank_min: 11000, closing_rank_max: 15000}
    ],
    average_placement_lpa: 9,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Jalandhar",
    location: "Jalandhar, Punjab",
    state: "Punjab",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 6500, closing_rank_max: 8000},
      {name: "ECE", closing_rank_min: 8500, closing_rank_max: 10500},
      {name: "EEE", closing_rank_min: 9500, closing_rank_max: 12000},
      {name: "MECH", closing_rank_min: 12000, closing_rank_max: 16000},
      {name: "CIVIL", closing_rank_min: 13000, closing_rank_max: 18000}
    ],
    average_placement_lpa: 8,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "MANIT Bhopal",
    location: "Bhopal, Madhya Pradesh",
    state: "Madhya Pradesh",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 4500, closing_rank_max: 6500},
      {name: "ECE", closing_rank_min: 6500, closing_rank_max: 8500},
      {name: "EEE", closing_rank_min: 8000, closing_rank_max: 11000},
      {name: "MECH", closing_rank_min: 10500, closing_rank_max: 14500},
      {name: "CIVIL", closing_rank_min: 12000, closing_rank_max: 16500}
    ],
    average_placement_lpa: 9,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Hamirpur",
    location: "Hamirpur, Himachal Pradesh",
    state: "Himachal Pradesh",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 7000, closing_rank_max: 9000},
      {name: "ECE", closing_rank_min: 9000, closing_rank_max: 11500},
      {name: "EEE", closing_rank_min: 10000, closing_rank_max: 13500},
      {name: "MECH", closing_rank_min: 13000, closing_rank_max: 17500},
      {name: "CIVIL", closing_rank_min: 14500, closing_rank_max: 19000}
    ],
    average_placement_lpa: 7,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "SVNIT Surat",
    location: "Surat, Gujarat",
    state: "Gujarat",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 4000, closing_rank_max: 5500},
      {name: "ECE", closing_rank_min: 6000, closing_rank_max: 8500},
      {name: "EEE", closing_rank_min: 7500, closing_rank_max: 10500},
      {name: "MECH", closing_rank_min: 10000, closing_rank_max: 14000},
      {name: "CIVIL", closing_rank_min: 11500, closing_rank_max: 15500}
    ],
    average_placement_lpa: 9,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Agartala",
    location: "Agartala, Tripura",
    state: "Tripura",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 12000, closing_rank_max: 15000},
      {name: "ECE", closing_rank_min: 15000, closing_rank_max: 18000},
      {name: "EEE", closing_rank_min: 16000, closing_rank_max: 20000},
      {name: "MECH", closing_rank_min: 18000, closing_rank_max: 23000},
      {name: "CIVIL", closing_rank_min: 19000, closing_rank_max: 25000}
    ],
    average_placement_lpa: 6,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Meghalaya",
    location: "Shillong, Meghalaya",
    state: "Meghalaya",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 11000, closing_rank_max: 14000},
      {name: "ECE", closing_rank_min: 14000, closing_rank_max: 17500},
      {name: "EEE", closing_rank_min: 15000, closing_rank_max: 19000},
      {name: "MECH", closing_rank_min: 17000, closing_rank_max: 22000},
      {name: "CIVIL", closing_rank_min: 18500, closing_rank_max: 24000}
    ],
    average_placement_lpa: 6,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Goa",
    location: "Farmagudi, Goa",
    state: "Goa",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 9500, closing_rank_max: 12000},
      {name: "ECE", closing_rank_min: 12500, closing_rank_max: 15500},
      {name: "EEE", closing_rank_min: 13500, closing_rank_max: 17000},
      {name: "MECH", closing_rank_min: 16000, closing_rank_max: 20000},
      {name: "CIVIL", closing_rank_min: 17000, closing_rank_max: 22000}
    ],
    average_placement_lpa: 7,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Arunachal Pradesh",
    location: "Yupia, Arunachal Pradesh",
    state: "Arunachal Pradesh",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 13000, closing_rank_max: 16000},
      {name: "ECE", closing_rank_min: 16000, closing_rank_max: 19000},
      {name: "EEE", closing_rank_min: 17000, closing_rank_max: 21000},
      {name: "MECH", closing_rank_min: 19000, closing_rank_max: 23000},
      {name: "CIVIL", closing_rank_min: 20000, closing_rank_max: 25000}
    ],
    average_placement_lpa: 6,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Sikkim",
    location: "Ravangla, Sikkim",
    state: "Sikkim",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 14000, closing_rank_max: 17000},
      {name: "ECE", closing_rank_min: 17000, closing_rank_max: 20000},
      {name: "EEE", closing_rank_min: 18000, closing_rank_max: 22000},
      {name: "MECH", closing_rank_min: 20000, closing_rank_max: 24000},
      {name: "CIVIL", closing_rank_min: 21000, closing_rank_max: 26000}
    ],
    average_placement_lpa: 6,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Puducherry",
    location: "Karaikal, Puducherry",
    state: "Puducherry",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 11500, closing_rank_max: 14000},
      {name: "ECE", closing_rank_min: 14000, closing_rank_max: 17000},
      {name: "EEE", closing_rank_min: 15000, closing_rank_max: 19000},
      {name: "MECH", closing_rank_min: 17000, closing_rank_max: 21000},
      {name: "CIVIL", closing_rank_min: 18000, closing_rank_max: 23000}
    ],
    average_placement_lpa: 6.5,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Manipur",
    location: "Imphal, Manipur",
    state: "Manipur",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 13000, closing_rank_max: 16000},
      {name: "ECE", closing_rank_min: 16000, closing_rank_max: 19000},
      {name: "EEE", closing_rank_min: 17000, closing_rank_max: 21000},
      {name: "MECH", closing_rank_min: 19000, closing_rank_max: 23000},
      {name: "CIVIL", closing_rank_min: 20000, closing_rank_max: 25000}
    ],
    average_placement_lpa: 5.5,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Mizoram",
    location: "Aizawl, Mizoram",
    state: "Mizoram",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 14000, closing_rank_max: 17000},
      {name: "ECE", closing_rank_min: 17000, closing_rank_max: 20000},
      {name: "EEE", closing_rank_min: 18000, closing_rank_max: 22000},
      {name: "MECH", closing_rank_min: 20000, closing_rank_max: 24000},
      {name: "CIVIL", closing_rank_min: 21000, closing_rank_max: 26000}
    ],
    average_placement_lpa: 5.5,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Uttarakhand",
    location: "Srinagar, Uttarakhand",
    state: "Uttarakhand",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 12500, closing_rank_max: 15500},
      {name: "ECE", closing_rank_min: 15000, closing_rank_max: 18000},
      {name: "EEE", closing_rank_min: 16500, closing_rank_max: 20000},
      {name: "MECH", closing_rank_min: 18000, closing_rank_max: 22000},
      {name: "CIVIL", closing_rank_min: 19500, closing_rank_max: 24000}
    ],
    average_placement_lpa: 6.5,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Delhi",
    location: "New Delhi, Delhi",
    state: "Delhi",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 6500, closing_rank_max: 9000},
      {name: "ECE", closing_rank_min: 9500, closing_rank_max: 12500},
      {name: "EEE", closing_rank_min: 10500, closing_rank_max: 14000},
      {name: "MECH", closing_rank_min: 13500, closing_rank_max: 18000},
      {name: "CIVIL", closing_rank_min: 15000, closing_rank_max: 20000}
    ],
    average_placement_lpa: 8.5,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Andhra Pradesh",
    location: "Tadepalligudem, Andhra Pradesh",
    state: "Andhra Pradesh",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 10500, closing_rank_max: 13500},
      {name: "ECE", closing_rank_min: 13500, closing_rank_max: 16500},
      {name: "EEE", closing_rank_min: 15000, closing_rank_max: 19000},
      {name: "MECH", closing_rank_min: 17500, closing_rank_max: 22000},
      {name: "CIVIL", closing_rank_min: 19000, closing_rank_max: 24000}
    ],
    average_placement_lpa: 6.5,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Nagaland",
    location: "Dimapur, Nagaland",
    state: "Nagaland",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 14000, closing_rank_max: 17500},
      {name: "ECE", closing_rank_min: 17500, closing_rank_max: 20500},
      {name: "EEE", closing_rank_min: 18500, closing_rank_max: 22500},
      {name: "MECH", closing_rank_min: 20000, closing_rank_max: 25000},
      {name: "CIVIL", closing_rank_min: 21500, closing_rank_max: 26000}
    ],
    average_placement_lpa: 5.5,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Jamshedpur",
    location: "Jamshedpur, Jharkhand",
    state: "Jharkhand",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 5500, closing_rank_max: 7500},
      {name: "ECE", closing_rank_min: 7500, closing_rank_max: 10500},
      {name: "EEE", closing_rank_min: 9000, closing_rank_max: 12500},
      {name: "MECH", closing_rank_min: 11500, closing_rank_max: 15500},
      {name: "CIVIL", closing_rank_min: 13000, closing_rank_max: 17000}
    ],
    average_placement_lpa: 8,
    tuition_fees_total_lakhs: 5
  },
  {
    name: "NIT Patna",
    location: "Patna, Bihar",
    state: "Bihar",
    type: "government",
    collegeType: "NIT",
    stream: "MPC",
    exam_accepted: "JEE Main",
    branches: [
      {name: "CSE", closing_rank_min: 7000, closing_rank_max: 9500},
      {name: "ECE", closing_rank_min: 9500, closing_rank_max: 12500},
      {name: "EEE", closing_rank_min: 10500, closing_rank_max: 14000},
      {name: "MECH", closing_rank_min: 13000, closing_rank_max: 17000},
      {name: "CIVIL", closing_rank_min: 14500, closing_rank_max: 19000}
    ],
    average_placement_lpa: 7.5,
    tuition_fees_total_lakhs: 5
  }
];

async function importMPCNITs() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear only existing NITs from MPC stream
    await College.deleteMany({ 
      stream: "MPC", 
      collegeType: "NIT" 
    });
    logger.info('Cleared existing MPC NIT data');

    // Insert all NIT data
    await College.insertMany(allNITs);
    logger.info(`Imported ${allNITs.length} NITs successfully`);

    console.log('✅ MPC NIT import finished successfully');
    console.log(`📊 Total NITs imported: ${allNITs.length}`);
    console.log(`🎯 Stream: MPC (JEE Main)`);
    console.log(`🏛️ College Type: NIT`);

    process.exit(0);

  } catch (error) {
    logger.error('Error importing MPC NITs:', error);
    console.error('❌ Failed to import MPC NITs:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  importMPCNITs();
}

export { importMPCNITs };