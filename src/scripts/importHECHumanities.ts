import mongoose from 'mongoose';
import College from '../models/College';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

// Helper function to parse percentile ranges like "97–99 %ile"
function parsePercentileRange(percentileString: string): { min: number, max: number } {
  const match = percentileString.match(/(\d+)(?:–|-)(\d+)/);
  if (match) {
    return { min: parseInt(match[1]), max: parseInt(match[2]) };
  }
  return { min: 80, max: 90 }; // fallback
}

// Helper function to convert percentile to approximate rank (assuming 100k test takers)
function percentileToRank(percentile: number): number {
  return Math.floor((100 - percentile) * 1000);
}

// Helper function to parse fees like "₹9 L" or "₹40k"
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

// Helper function to group courses by college
function groupCoursesByCollege(colleges: any[]) {
  const collegeMap = new Map();
  
  colleges.forEach(college => {
    const key = college.name;
    if (!collegeMap.has(key)) {
      collegeMap.set(key, {
        name: college.name,
        location: college.location,
        accepted_exam: college.accepted_exam,
        closing_percentile: college.closing_percentile,
        avg_placement_lpa: college.avg_placement_lpa,
        fees_per_year: college.fees_per_year,
        courses: []
      });
    }
    collegeMap.get(key).courses.push(college.course);
  });
  
  return Array.from(collegeMap.values());
}

// Raw HEC data from user
const rawHECData = [
  {"name":"Lady Shri Ram College (DU)","course":"History","accepted_exam":"CUET","closing_percentile":"97–99","avg_placement_lpa":8,"fees_per_year":"₹40k","location":"Delhi"},
  {"name":"Lady Shri Ram College (DU)","course":"Political Science","accepted_exam":"CUET","closing_percentile":"97–99","avg_placement_lpa":8,"fees_per_year":"₹40k","location":"Delhi"},
  {"name":"Lady Shri Ram College (DU)","course":"Economics","accepted_exam":"CUET","closing_percentile":"97–99","avg_placement_lpa":8,"fees_per_year":"₹40k","location":"Delhi"},
  {"name":"Lady Shri Ram College (DU)","course":"Psychology","accepted_exam":"CUET","closing_percentile":"97–99","avg_placement_lpa":8,"fees_per_year":"₹40k","location":"Delhi"},
  
  {"name":"Hindu College (DU)","course":"History","accepted_exam":"CUET","closing_percentile":"97–99","avg_placement_lpa":9,"fees_per_year":"₹35k","location":"Delhi"},
  {"name":"Hindu College (DU)","course":"Political Science","accepted_exam":"CUET","closing_percentile":"97–99","avg_placement_lpa":9,"fees_per_year":"₹35k","location":"Delhi"},
  {"name":"Hindu College (DU)","course":"Economics","accepted_exam":"CUET","closing_percentile":"97–99","avg_placement_lpa":9,"fees_per_year":"₹35k","location":"Delhi"},

  {"name":"Miranda House (DU)","course":"History","accepted_exam":"CUET","closing_percentile":"96–99","avg_placement_lpa":8,"fees_per_year":"₹30k","location":"Delhi"},
  {"name":"Miranda House (DU)","course":"Sociology","accepted_exam":"CUET","closing_percentile":"96–99","avg_placement_lpa":8,"fees_per_year":"₹30k","location":"Delhi"},
  {"name":"Miranda House (DU)","course":"Economics","accepted_exam":"CUET","closing_percentile":"96–99","avg_placement_lpa":8,"fees_per_year":"₹30k","location":"Delhi"},

  {"name":"St. Stephen's College (DU)","course":"History","accepted_exam":"CUET + Interview","closing_percentile":"98–99","avg_placement_lpa":9,"fees_per_year":"₹40k","location":"Delhi"},
  {"name":"St. Stephen's College (DU)","course":"Economics","accepted_exam":"CUET + Interview","closing_percentile":"98–99","avg_placement_lpa":9,"fees_per_year":"₹40k","location":"Delhi"},
  {"name":"St. Stephen's College (DU)","course":"English","accepted_exam":"CUET + Interview","closing_percentile":"98–99","avg_placement_lpa":9,"fees_per_year":"₹40k","location":"Delhi"},
  {"name":"St. Stephen's College (DU)","course":"Political Science","accepted_exam":"CUET + Interview","closing_percentile":"98–99","avg_placement_lpa":9,"fees_per_year":"₹40k","location":"Delhi"},

  {"name":"Hansraj College (DU)","course":"History","accepted_exam":"CUET","closing_percentile":"96–98","avg_placement_lpa":8,"fees_per_year":"₹35k","location":"Delhi"},
  {"name":"Hansraj College (DU)","course":"Economics","accepted_exam":"CUET","closing_percentile":"96–98","avg_placement_lpa":8,"fees_per_year":"₹35k","location":"Delhi"},
  {"name":"Hansraj College (DU)","course":"Sociology","accepted_exam":"CUET","closing_percentile":"96–98","avg_placement_lpa":8,"fees_per_year":"₹35k","location":"Delhi"},

  {"name":"Ashoka University (Sonipat)","course":"History","accepted_exam":"CUET / SAT","closing_percentile":"95–98","avg_placement_lpa":12,"fees_per_year":"₹9 L","location":"Haryana"},
  {"name":"Ashoka University (Sonipat)","course":"Economics","accepted_exam":"CUET / SAT","closing_percentile":"95–98","avg_placement_lpa":12,"fees_per_year":"₹9 L","location":"Haryana"},
  {"name":"Ashoka University (Sonipat)","course":"Political Science","accepted_exam":"CUET / SAT","closing_percentile":"95–98","avg_placement_lpa":12,"fees_per_year":"₹9 L","location":"Haryana"},
  {"name":"Ashoka University (Sonipat)","course":"Psychology","accepted_exam":"CUET / SAT","closing_percentile":"95–98","avg_placement_lpa":12,"fees_per_year":"₹9 L","location":"Haryana"},

  {"name":"Krea University (Sri City)","course":"History","accepted_exam":"KIC / CUET","closing_percentile":"90–95","avg_placement_lpa":10,"fees_per_year":"₹7 L","location":"Andhra Pradesh"},
  {"name":"Krea University (Sri City)","course":"Economics","accepted_exam":"KIC / CUET","closing_percentile":"90–95","avg_placement_lpa":10,"fees_per_year":"₹7 L","location":"Andhra Pradesh"},
  {"name":"Krea University (Sri City)","course":"Political Science","accepted_exam":"KIC / CUET","closing_percentile":"90–95","avg_placement_lpa":10,"fees_per_year":"₹7 L","location":"Andhra Pradesh"},
  {"name":"Krea University (Sri City)","course":"Social Studies","accepted_exam":"KIC / CUET","closing_percentile":"90–95","avg_placement_lpa":10,"fees_per_year":"₹7 L","location":"Andhra Pradesh"},

  {"name":"Shiv Nadar University (Noida)","course":"History","accepted_exam":"CUET / SNU Scholastic Test","closing_percentile":"85–90","avg_placement_lpa":9,"fees_per_year":"₹6.5 L","location":"Uttar Pradesh"},
  {"name":"Shiv Nadar University (Noida)","course":"Sociology","accepted_exam":"CUET / SNU Scholastic Test","closing_percentile":"85–90","avg_placement_lpa":9,"fees_per_year":"₹6.5 L","location":"Uttar Pradesh"},
  {"name":"Shiv Nadar University (Noida)","course":"Liberal Arts","accepted_exam":"CUET / SNU Scholastic Test","closing_percentile":"85–90","avg_placement_lpa":9,"fees_per_year":"₹6.5 L","location":"Uttar Pradesh"},

  {"name":"Flame University (Pune)","course":"Psychology","accepted_exam":"SAT / CUET","closing_percentile":"85–90","avg_placement_lpa":8,"fees_per_year":"₹6 L","location":"Maharashtra"},
  {"name":"Flame University (Pune)","course":"International Studies","accepted_exam":"SAT / CUET","closing_percentile":"85–90","avg_placement_lpa":8,"fees_per_year":"₹6 L","location":"Maharashtra"},
  {"name":"Flame University (Pune)","course":"Public Policy","accepted_exam":"SAT / CUET","closing_percentile":"85–90","avg_placement_lpa":8,"fees_per_year":"₹6 L","location":"Maharashtra"},

  {"name":"OP Jindal Global University (Sonipat)","course":"Liberal Arts & Humanities","accepted_exam":"JSAT / CUET","closing_percentile":"85–90","avg_placement_lpa":9,"fees_per_year":"₹6.5 L","location":"Haryana"},
  {"name":"OP Jindal Global University (Sonipat)","course":"International Relations","accepted_exam":"JSAT / CUET","closing_percentile":"85–90","avg_placement_lpa":9,"fees_per_year":"₹6.5 L","location":"Haryana"},

  {"name":"Azim Premji University (Bengaluru)","course":"Economics","accepted_exam":"CUET","closing_percentile":"80–85","avg_placement_lpa":5,"fees_per_year":"₹1.8 L","location":"Karnataka"},
  {"name":"Azim Premji University (Bengaluru)","course":"Development","accepted_exam":"CUET","closing_percentile":"80–85","avg_placement_lpa":5,"fees_per_year":"₹1.8 L","location":"Karnataka"},
  {"name":"Azim Premji University (Bengaluru)","course":"Public Policy","accepted_exam":"CUET","closing_percentile":"80–85","avg_placement_lpa":5,"fees_per_year":"₹1.8 L","location":"Karnataka"},

  {"name":"Tata Institute of Social Sciences (TISS)","course":"Social Sciences","accepted_exam":"TISS-NET","closing_percentile":"85–90","avg_placement_lpa":9,"fees_per_year":"₹1 L","location":"Maharashtra"},
  {"name":"Tata Institute of Social Sciences (TISS)","course":"Development Studies","accepted_exam":"TISS-NET","closing_percentile":"85–90","avg_placement_lpa":9,"fees_per_year":"₹1 L","location":"Maharashtra"},

  {"name":"St. Xavier's College (Mumbai)","course":"History","accepted_exam":"College Entrance / CUET","closing_percentile":"90–95","avg_placement_lpa":6,"fees_per_year":"₹80k","location":"Maharashtra"},
  {"name":"St. Xavier's College (Mumbai)","course":"Political Science","accepted_exam":"College Entrance / CUET","closing_percentile":"90–95","avg_placement_lpa":6,"fees_per_year":"₹80k","location":"Maharashtra"},
  {"name":"St. Xavier's College (Mumbai)","course":"Psychology","accepted_exam":"College Entrance / CUET","closing_percentile":"90–95","avg_placement_lpa":6,"fees_per_year":"₹80k","location":"Maharashtra"},
  {"name":"St. Xavier's College (Mumbai)","course":"Sociology","accepted_exam":"College Entrance / CUET","closing_percentile":"90–95","avg_placement_lpa":6,"fees_per_year":"₹80k","location":"Maharashtra"}
];

// Group courses by college and convert to College model format
const groupedColleges = groupCoursesByCollege(rawHECData);

const allHECColleges = groupedColleges.map(college => {
  const percentileRange = parsePercentileRange(college.closing_percentile);
  const minRank = percentileToRank(percentileRange.max);
  const maxRank = percentileToRank(percentileRange.min);
  
  // Extract state from location
  let state = "";
  let location = "";
  if (college.location.includes("Delhi")) {
    state = "Delhi";
    location = "New Delhi, Delhi";
  } else if (college.location === "Haryana") {
    state = "Haryana";
    location = college.name.includes("Ashoka") ? "Sonipat, Haryana" : "Sonipat, Haryana";
  } else if (college.location === "Maharashtra") {
    state = "Maharashtra";
    location = college.name.includes("Mumbai") ? "Mumbai, Maharashtra" : "Pune, Maharashtra";
  } else if (college.location === "Karnataka") {
    state = "Karnataka";
    location = "Bengaluru, Karnataka";
  } else if (college.location === "Andhra Pradesh") {
    state = "Andhra Pradesh";
    location = "Sri City, Andhra Pradesh";
  } else if (college.location === "Uttar Pradesh") {
    state = "Uttar Pradesh";
    location = "Noida, Uttar Pradesh";
  } else {
    state = college.location;
    location = college.location;
  }

  // Determine college type
  let type: 'government' | 'private' | 'deemed' = 'private';
  if (college.name.includes("(DU)") || college.name.includes("TISS")) {
    type = 'government';
  }

  return {
    name: college.name,
    location: location,
    state: state,
    type: type,
    collegeType: "Arts" as const,
    stream: "HEC" as const,
    exam_accepted: college.accepted_exam,
    branches: college.courses.map((course: string) => ({
      name: course,
      closing_rank_min: minRank,
      closing_rank_max: maxRank
    })),
    average_placement_lpa: college.avg_placement_lpa,
    tuition_fees_total_lakhs: parseFees(college.fees_per_year) * 3, // 3 years for BA programs
    closing_percentile: college.closing_percentile
  };
});

async function importHECColleges() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear existing HEC stream colleges
    await College.deleteMany({ 
      stream: "HEC"
    });
    logger.info('Cleared existing HEC Humanities data');

    // Insert all HEC college data
    await College.insertMany(allHECColleges);
    logger.info(`Imported ${allHECColleges.length} HEC colleges successfully`);

    console.log('✅ HEC Humanities Colleges import finished successfully');
    console.log('==========================================================');
    console.log(`📊 Total HEC Colleges imported: ${allHECColleges.length}`);
    console.log(`🎯 Stream: HEC (Humanities, Economics, Commerce)`);
    console.log(`📝 Exams: CUET, SAT, TISS-NET, JSAT, KIC, College Entrance`);
    console.log(`🎓 Courses: History, Political Science, Economics, Psychology, Sociology, English, Liberal Arts`);
    console.log(`🏛️ College Types: DU Colleges (5), Private Universities (9), Central Institutes (1)`);
    console.log(`🏆 Percentile Range: 80-99%ile (comprehensive humanities education coverage)`);

    process.exit(0);

  } catch (error) {
    logger.error('Error importing HEC colleges:', error);
    console.error('❌ Failed to import HEC colleges:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  importHECColleges();
}

export { importHECColleges };