import mongoose from 'mongoose';
import College from '../models/College';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

async function testCollegeData() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Count total colleges
    const totalCount = await College.countDocuments();
    console.log(`Total colleges in database: ${totalCount}`);

    // Count by stream
    const streamCounts = await College.aggregate([
      { $group: { _id: '$stream', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('Colleges by stream:', streamCounts);

    // Count by exam
    const examCounts = await College.aggregate([
      { $group: { _id: '$exam_accepted', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('Colleges by exam:', examCounts);

    // Get a few sample MPC colleges
    const mpcColleges = await College.find({ stream: 'MPC' }).limit(3);
    console.log('Sample MPC colleges:');
    mpcColleges.forEach((college: any, i: number) => {
      console.log(`${i+1}. ${college.name} - ${college.exam_accepted} - ${college.stream}`);
    });

    // Test the exact query used in predictor
    const testColleges = await College.find({
      stream: 'MPC',
      exam_accepted: { $regex: 'JEE Main', $options: 'i' },
    });
    console.log(`Colleges matching MPC + JEE Main: ${testColleges.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testCollegeData();
}