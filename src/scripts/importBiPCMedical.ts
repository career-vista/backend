import mongoose from 'mongoose';
import College from '../models/College';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

// BiPC Stream - ALL 32 Medical Colleges (NEET) - Simplified version
const allMedicalColleges = [
  {
    name: "AIIMS Delhi",
    location: "New Delhi, Delhi",
    state: "Delhi",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 1, closing_rank_max: 100}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.075
  },
  {
    name: "AIIMS Jodhpur",
    location: "Jodhpur, Rajasthan",
    state: "Rajasthan",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 150, closing_rank_max: 1000}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.058
  },
  {
    name: "AIIMS Bhubaneswar",
    location: "Bhubaneswar, Odisha",
    state: "Odisha",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 500, closing_rank_max: 1500}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.058
  },
  {
    name: "AIIMS Rishikesh",
    location: "Rishikesh, Uttarakhand",
    state: "Uttarakhand",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 800, closing_rank_max: 2000}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.06
  },
  {
    name: "AIIMS Raipur",
    location: "Raipur, Chhattisgarh",
    state: "Chhattisgarh",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 1000, closing_rank_max: 2200}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.06
  },
  {
    name: "AIIMS Bhopal",
    location: "Bhopal, Madhya Pradesh",
    state: "Madhya Pradesh",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 1200, closing_rank_max: 2500}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.06
  },
  {
    name: "AIIMS Patna",
    location: "Patna, Bihar",
    state: "Bihar",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 1800, closing_rank_max: 3000}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.06
  },
  {
    name: "AIIMS Nagpur",
    location: "Nagpur, Maharashtra",
    state: "Maharashtra",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 2000, closing_rank_max: 3500}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.06
  },
  {
    name: "AIIMS Bathinda",
    location: "Bathinda, Punjab",
    state: "Punjab",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 3500, closing_rank_max: 5000}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.06
  },
  {
    name: "AIIMS Kalyani",
    location: "Kalyani, West Bengal",
    state: "West Bengal",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 3500, closing_rank_max: 5500}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.06
  },
  {
    name: "AIIMS Deoghar",
    location: "Deoghar, Jharkhand",
    state: "Jharkhand",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 4000, closing_rank_max: 6000}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.06
  },
  {
    name: "AIIMS Bibinagar",
    location: "Bibinagar, Telangana",
    state: "Telangana",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 4000, closing_rank_max: 6500}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.06
  },
  {
    name: "AIIMS Raebareli",
    location: "Raebareli, Uttar Pradesh",
    state: "Uttar Pradesh",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 4000, closing_rank_max: 6800}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.06
  },
  {
    name: "JIPMER Puducherry",
    location: "Puducherry, Puducherry",
    state: "Puducherry",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 1000, closing_rank_max: 2500}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.65
  },
  {
    name: "Maulana Azad Medical College",
    location: "New Delhi, Delhi",
    state: "Delhi",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 80, closing_rank_max: 130}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.15
  },
  {
    name: "University College of Medical Sciences",
    location: "New Delhi, Delhi",
    state: "Delhi",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 150, closing_rank_max: 300}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.275
  },
  {
    name: "Lady Hardinge Medical College",
    location: "New Delhi, Delhi",
    state: "Delhi",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 300, closing_rank_max: 500}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.077
  },
  {
    name: "King George's Medical University",
    location: "Lucknow, Uttar Pradesh",
    state: "Uttar Pradesh",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 300, closing_rank_max: 600}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 3
  },
  {
    name: "Institute of Medical Sciences BHU",
    location: "Varanasi, Uttar Pradesh",
    state: "Uttar Pradesh",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 400, closing_rank_max: 800}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.7
  },
  {
    name: "Seth GS Medical College",
    location: "Mumbai, Maharashtra",
    state: "Maharashtra",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 300, closing_rank_max: 600}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 1
  },
  {
    name: "Grant Medical College",
    location: "Mumbai, Maharashtra",
    state: "Maharashtra",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 600, closing_rank_max: 1000}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 1
  },
  {
    name: "B.J. Medical College",
    location: "Ahmedabad, Gujarat",
    state: "Gujarat",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 650, closing_rank_max: 1200}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 1.25
  },
  {
    name: "SMS Medical College",
    location: "Jaipur, Rajasthan",
    state: "Rajasthan",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 700, closing_rank_max: 1200}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 1.7
  },
  {
    name: "Madras Medical College",
    location: "Chennai, Tamil Nadu",
    state: "Tamil Nadu",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 700, closing_rank_max: 1100}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.4
  },
  {
    name: "Stanley Medical College",
    location: "Chennai, Tamil Nadu",
    state: "Tamil Nadu",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 900, closing_rank_max: 1300}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.4
  },
  {
    name: "Osmania Medical College",
    location: "Hyderabad, Telangana",
    state: "Telangana",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 1000, closing_rank_max: 1500}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 3
  },
  {
    name: "Gandhi Medical College Hyderabad",
    location: "Hyderabad, Telangana",
    state: "Telangana",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 1100, closing_rank_max: 1600}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 3
  },
  {
    name: "Bangalore Medical College",
    location: "Bangalore, Karnataka",
    state: "Karnataka",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 800, closing_rank_max: 1400}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 3
  },
  {
    name: "Government Medical College Kozhikode",
    location: "Kozhikode, Kerala",
    state: "Kerala",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 1200, closing_rank_max: 2000}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.3
  },
  {
    name: "Government Medical College Chandigarh",
    location: "Chandigarh, Chandigarh",
    state: "Chandigarh",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 500, closing_rank_max: 1200}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 1.3
  },
  {
    name: "VMMC & Safdarjung Hospital",
    location: "New Delhi, Delhi",
    state: "Delhi",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 100, closing_rank_max: 300}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.25
  },
  {
    name: "Government Medical College Thiruvananthapuram",
    location: "Thiruvananthapuram, Kerala",
    state: "Kerala",
    type: "government",
    collegeType: "Medical",
    stream: "BiPC",
    exam_accepted: "NEET",
    branches: [
      {name: "MBBS", closing_rank_min: 700, closing_rank_max: 1200}
    ],
    average_placement_lpa: 0,
    tuition_fees_total_lakhs: 0.3
  }
];

async function importBiPCMedicalColleges() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear existing BiPC stream colleges
    await College.deleteMany({ 
      stream: "BiPC"
    });
    logger.info('Cleared existing BiPC Medical data');

    // Insert all medical college data
    await College.insertMany(allMedicalColleges);
    logger.info(`Imported ${allMedicalColleges.length} Medical colleges successfully`);

    console.log('✅ BiPC Medical Colleges import finished successfully');
    console.log('================================================');
    console.log(`📊 Total Medical Colleges imported: ${allMedicalColleges.length}`);
    console.log(`🎯 Stream: BiPC (Biology, Physics, Chemistry)`);
    console.log(`📝 Exam: NEET`);
    console.log(`🎓 Course: MBBS`);
    console.log(`🏛️ College Types: AIIMS (13), JIPMER (1), Government Medical Colleges (18)`);
    console.log(`🏆 Rank Range: 1 to 6,800 (comprehensive coverage)`);

    process.exit(0);

  } catch (error) {
    logger.error('Error importing BiPC Medical colleges:', error);
    console.error('❌ Failed to import BiPC Medical colleges:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  importBiPCMedicalColleges();
}

export { importBiPCMedicalColleges };