import mongoose from 'mongoose';
import College from '../models/College';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

// Helper function to parse rank ranges like "Rank 1–100" or "90–95 %ile"
function parseRankRange(rankString: string): { min: number, max: number } {
  // Handle percentile format "90–95 %ile"
  const percentileMatch = rankString.match(/(\d+)(?:–|-)(\d+)\s*%ile/);
  if (percentileMatch) {
    const minPercentile = parseInt(percentileMatch[1]);
    const maxPercentile = parseInt(percentileMatch[2]);
    // Convert percentile to approximate rank (assuming 100k total test takers)
    return { 
      min: Math.floor((100 - maxPercentile) * 1000), 
      max: Math.floor((100 - minPercentile) * 1000) 
    };
  }
  
  // Handle rank format "Rank 1–100"
  const rankMatch = rankString.match(/Rank\s+(\d+)(?:–|-)(\d+)/);
  if (rankMatch) {
    return { min: parseInt(rankMatch[1]), max: parseInt(rankMatch[2]) };
  }
  
  // Handle single rank format "Rank 1–500"
  const singleRankMatch = rankString.match(/Rank\s+\d+(?:–|-)(\d+)/);
  if (singleRankMatch) {
    const maxRank = parseInt(singleRankMatch[1]);
    return { min: 1, max: maxRank };
  }
  
  return { min: 1, max: 1000 }; // fallback
}

// Helper function to parse fees like "₹2.8 L" or "₹40k"
function parseFees(feesString: string): number {
  const lakhMatch = feesString.match(/₹(\d+(?:\.\d+)?)\s*L/);
  if (lakhMatch) {
    return parseFloat(lakhMatch[1]);
  }
  
  const thousandMatch = feesString.match(/₹(\d+(?:\.\d+)?)\s*k/i);
  if (thousandMatch) {
    return parseFloat(thousandMatch[1]) / 100; // Convert thousands to lakhs
  }
  
  return 2; // fallback
}

// CEC Stream - ALL 24 Law Colleges (CLAT/AILET/LSAT/Other Law Exams)
const allCECColleges = [
  {
    name: "National Law School of India University (NLSIU)",
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B (Hons)", closing_rank_min: 1, closing_rank_max: 100}
    ],
    average_placement_lpa: 16,
    tuition_fees_total_lakhs: 14, // 5 years * 2.8L
    closing_percentile: "99-99.9"
  },
  {
    name: "National Law University (NLU) Delhi",
    location: "New Delhi, Delhi",
    state: "Delhi",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "AILET",
    branches: [
      {name: "B.A. LL.B (Hons)", closing_rank_min: 1, closing_rank_max: 150}
    ],
    average_placement_lpa: 18,
    tuition_fees_total_lakhs: 13.5, // 5 years * 2.7L
    closing_percentile: "99-99.9"
  },
  {
    name: "NALSAR University of Law",
    location: "Hyderabad, Telangana",
    state: "Telangana",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B (Hons)", closing_rank_min: 100, closing_rank_max: 180}
    ],
    average_placement_lpa: 14,
    tuition_fees_total_lakhs: 13, // 5 years * 2.6L
    closing_percentile: "98-99"
  },
  {
    name: "The West Bengal National University of Juridical Sciences (WBNUJS)",
    location: "Kolkata, West Bengal",
    state: "West Bengal",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B (Hons)", closing_rank_min: 200, closing_rank_max: 350}
    ],
    average_placement_lpa: 12,
    tuition_fees_total_lakhs: 12, // 5 years * 2.4L
    closing_percentile: "96-98"
  },
  {
    name: "Gujarat National Law University (GNLU)",
    location: "Gandhinagar, Gujarat",
    state: "Gujarat",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B (Hons)", closing_rank_min: 300, closing_rank_max: 450}
    ],
    average_placement_lpa: 11,
    tuition_fees_total_lakhs: 11.5, // 5 years * 2.3L
    closing_percentile: "94-96"
  },
  {
    name: "Indian Institute of Technology (IIT) Kharagpur",
    location: "Kharagpur, West Bengal",
    state: "West Bengal",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B (Hons)", closing_rank_min: 400, closing_rank_max: 500}
    ],
    average_placement_lpa: 10,
    tuition_fees_total_lakhs: 12.5, // 5 years * 2.5L
    closing_percentile: "93-95"
  },
  {
    name: "Symbiosis Law School (SLS) Pune",
    location: "Pune, Maharashtra",
    state: "Maharashtra",
    type: "private",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "SLAT",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 5000, closing_rank_max: 10000},
      {name: "BBA LL.B", closing_rank_min: 6000, closing_rank_max: 12000}
    ],
    average_placement_lpa: 9,
    tuition_fees_total_lakhs: 17.5, // 5 years * 3.5L
    closing_percentile: "90-95"
  },
  {
    name: "Jamia Millia Islamia (JMI)",
    location: "New Delhi, Delhi",
    state: "Delhi",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 300, closing_rank_max: 400}
    ],
    average_placement_lpa: 8,
    tuition_fees_total_lakhs: 7.5, // 5 years * 1.5L
    closing_percentile: "94-96"
  },
  {
    name: "Aligarh Muslim University (AMU)",
    location: "Aligarh, Uttar Pradesh",
    state: "Uttar Pradesh",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 400, closing_rank_max: 500}
    ],
    average_placement_lpa: 7,
    tuition_fees_total_lakhs: 6, // 5 years * 1.2L
    closing_percentile: "93-95"
  },
  {
    name: "Faculty of Law, University of Delhi",
    location: "New Delhi, Delhi",
    state: "Delhi",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "DU LLB Entrance",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 500}
    ],
    average_placement_lpa: 8,
    tuition_fees_total_lakhs: 2, // 5 years * 40k
    closing_percentile: "93-98"
  },
  {
    name: "Faculty of Law, Banaras Hindu University (BHU)",
    location: "Varanasi, Uttar Pradesh",
    state: "Uttar Pradesh",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B (Hons)", closing_rank_min: 500, closing_rank_max: 700}
    ],
    average_placement_lpa: 6,
    tuition_fees_total_lakhs: 3, // 5 years * 60k
    closing_percentile: "91-93"
  },
  {
    name: "OP Jindal Global University (JGU)",
    location: "Sonipat, Haryana",
    state: "Haryana",
    type: "private",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "LSAT India",
    branches: [
      {name: "B.A. LL.B (Hons)", closing_rank_min: 1, closing_rank_max: 500}
    ],
    average_placement_lpa: 10,
    tuition_fees_total_lakhs: 30, // 5 years * 6L
    closing_percentile: "93-98"
  },
  {
    name: "Azim Premji University",
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    type: "private",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CUET",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 5,
    tuition_fees_total_lakhs: 10, // 5 years * 2L
    closing_percentile: "85-95"
  },
  {
    name: "Krea University",
    location: "Sri City, Andhra Pradesh",
    state: "Andhra Pradesh",
    type: "private",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CUET",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 6,
    tuition_fees_total_lakhs: 35, // 5 years * 7L
    closing_percentile: "85-95"
  },
  {
    name: "NMIMS School of Law",
    location: "Mumbai, Maharashtra",
    state: "Maharashtra",
    type: "private",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "NPAT",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000},
      {name: "BBA LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 8,
    tuition_fees_total_lakhs: 20, // 5 years * 4L
    closing_percentile: "85-95"
  },
  {
    name: "ICFAI Law School",
    location: "Hyderabad, Telangana",
    state: "Telangana",
    type: "private",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "LSAT India",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000},
      {name: "BBA LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 6,
    tuition_fees_total_lakhs: 11, // 5 years * 2.2L
    closing_percentile: "85-95"
  },
  {
    name: "Alliance University",
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    type: "private",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "LSAT India",
    branches: [
      {name: "BBA LL.B", closing_rank_min: 1, closing_rank_max: 1000},
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 5,
    tuition_fees_total_lakhs: 10, // 5 years * 2L
    closing_percentile: "85-95"
  },
  {
    name: "Siksha 'O' Anusandhan (SOA) University",
    location: "Bhubaneswar, Odisha",
    state: "Odisha",
    type: "private",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 5,
    tuition_fees_total_lakhs: 7.5, // 5 years * 1.5L
    closing_percentile: "85-95"
  },
  {
    name: "Hidayatullah National Law University (HNLU)",
    location: "Raipur, Chhattisgarh",
    state: "Chhattisgarh",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 6,
    tuition_fees_total_lakhs: 9, // 5 years * 1.8L
    closing_percentile: "85-95"
  },
  {
    name: "Dr. Ram Manohar Lohiya National Law University (RMLNLU)",
    location: "Lucknow, Uttar Pradesh",
    state: "Uttar Pradesh",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 5,
    tuition_fees_total_lakhs: 7.5, // 5 years * 1.5L
    closing_percentile: "85-95"
  },
  {
    name: "National University of Study and Research in Law (NUSRL)",
    location: "Ranchi, Jharkhand",
    state: "Jharkhand",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 5,
    tuition_fees_total_lakhs: 6, // 5 years * 1.2L
    closing_percentile: "85-95"
  },
  {
    name: "Damodaram Sanjivayya National Law University (DSNLU)",
    location: "Visakhapatnam, Andhra Pradesh",
    state: "Andhra Pradesh",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 5,
    tuition_fees_total_lakhs: 7.5, // 5 years * 1.5L
    closing_percentile: "85-95"
  },
  {
    name: "Maharashtra National Law University (MNLU) Mumbai",
    location: "Mumbai, Maharashtra",
    state: "Maharashtra",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 6,
    tuition_fees_total_lakhs: 10, // 5 years * 2L
    closing_percentile: "85-95"
  },
  {
    name: "Maharashtra National Law University (MNLU) Aurangabad",
    location: "Aurangabad, Maharashtra",
    state: "Maharashtra",
    type: "government",
    collegeType: "Law",
    stream: "CEC",
    exam_accepted: "CLAT",
    branches: [
      {name: "B.A. LL.B", closing_rank_min: 1, closing_rank_max: 1000}
    ],
    average_placement_lpa: 5,
    tuition_fees_total_lakhs: 9, // 5 years * 1.8L
    closing_percentile: "85-95"
  }
];

async function importCECColleges() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear existing CEC stream colleges
    await College.deleteMany({ 
      stream: "CEC"
    });
    logger.info('Cleared existing CEC Law data');

    // Insert all CEC college data
    await College.insertMany(allCECColleges);
    logger.info(`Imported ${allCECColleges.length} CEC colleges successfully`);

    console.log('✅ CEC Law Colleges import finished successfully');
    console.log('==========================================================');
    console.log(`📊 Total CEC Colleges imported: ${allCECColleges.length}`);
    console.log(`🎯 Stream: CEC (Commerce, Economics, Law)`);
    console.log(`📝 Exams: CLAT, AILET, LSAT India, SLAT, DU LLB, NPAT, CUET`);
    console.log(`🎓 Courses: B.A. LL.B (Hons), BBA LL.B, B.A. LL.B`);
    console.log(`🏛️ College Types: National Law Universities (11), Private Law Schools (8), Central Universities (5)`);
    console.log(`🏆 Rank Range: 1-1000 (comprehensive coverage from top NLUs to emerging institutions)`);

    process.exit(0);

  } catch (error) {
    logger.error('Error importing CEC colleges:', error);
    console.error('❌ Failed to import CEC colleges:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  importCECColleges();
}

export { importCECColleges };