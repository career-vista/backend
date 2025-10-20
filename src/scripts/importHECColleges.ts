import mongoose from 'mongoose';
import College from '../models/College';
import { logger } from '../utils/logger';
import hecCollegesData from '../data/hecColleges.json';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careervista');
    logger.info('MongoDB connected for HEC colleges import');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Helper function to parse fees string
const parseFees = (feesStr: string): number => {
  if (!feesStr) return 0;
  const cleanStr = feesStr.replace(/[₹,k]/g, '').replace(/L/g, '00000').trim();
  return parseInt(cleanStr) || 0;
};

// Helper function to parse percentile range
const parsePercentileRange = (percentileStr: string): { min: number; max: number } => {
  if (!percentileStr) return { min: 0, max: 0 };
  const range = percentileStr.replace(/[–-]/g, '-').split('-');
  const min = parseInt(range[0]) || 0;
  const max = parseInt(range[1] || range[0]) || min;
  return { min, max };
};

// Helper function to determine state from location
const getStateFromLocation = (location: string): string => {
  const locationStateMap: { [key: string]: string } = {
    'Delhi': 'Delhi',
    'Haryana': 'Haryana',
    'Andhra Pradesh': 'Andhra Pradesh',
    'Uttar Pradesh': 'Uttar Pradesh',
    'Maharashtra': 'Maharashtra',
    'Karnataka': 'Karnataka',
  };
  
  for (const [loc, state] of Object.entries(locationStateMap)) {
    if (location.includes(loc)) {
      return state;
    }
  }
  return location;
};

// Helper function to determine college type
const getCollegeType = (name: string): 'government' | 'private' | 'deemed' => {
  if (name.includes('DU') || name.includes('Delhi University')) {
    return 'government';
  }
  if (name.includes('University') || name.includes('Institute')) {
    return 'private';
  }
  return 'government';
};

const importHECColleges = async () => {
  try {
    await connectDB();
    
    logger.info('Starting HEC colleges import...');
    
    // Clear existing HEC colleges
    await College.deleteMany({ streams: 'HEC' });
    logger.info('Cleared existing HEC colleges');
    
    const colleges = hecCollegesData.colleges;
    const processedColleges: any[] = [];
    
    for (const college of colleges) {
      const state = getStateFromLocation(college.location);
      const city = college.location.split(',')[0]?.trim() || state;
      const fees = parseFees(college.fees_per_year);
      const percentileRange = parsePercentileRange(college.closing_percentile);
      
      const collegeDoc = {
        name: college.name,
        course: college.course,
        location: college.location,
        city: city,
        state: state,
        type: getCollegeType(college.name),
        streams: ['HEC'],
        accepted_exam: college.accepted_exam,
        closing_percentile: college.closing_percentile,
        avg_placement_lpa: college.avg_placement_lpa,
        fees_per_year: college.fees_per_year,
        fees: {
          tuition: fees,
        },
        placements: {
          averageCTC: college.avg_placement_lpa * 100000, // Convert LPA to annual
        },
        cutoffs: {
          [college.accepted_exam]: percentileRange.min,
        },
        courses: [college.course],
        facilities: [],
        website: `https://${college.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
        contactInfo: {
          address: college.location,
        },
      };
      
      processedColleges.push(collegeDoc);
    }
    
    // Insert colleges
    await College.insertMany(processedColleges);
    
    logger.info(`Successfully imported ${processedColleges.length} HEC colleges`);
    
    // Print summary
    const uniqueColleges = [...new Set(colleges.map(c => c.name))];
    const uniqueExams = [...new Set(colleges.map(c => c.accepted_exam))];
    const uniqueCourses = [...new Set(colleges.map(c => c.course))];
    
    logger.info('Import Summary:');
    logger.info(`- Total records: ${processedColleges.length}`);
    logger.info(`- Unique colleges: ${uniqueColleges.length}`);
    logger.info(`- Exams supported: ${uniqueExams.join(', ')}`);
    logger.info(`- Courses available: ${uniqueCourses.join(', ')}`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Error importing HEC colleges:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  importHECColleges();
}

export default importHECColleges;