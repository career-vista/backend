import mongoose from 'mongoose';
import College from '../models/College';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

async function debugExamFiltering() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get some sample colleges to see exam format
    const samples = await College.find({}).limit(10);
    
    console.log('🔍 SAMPLE COLLEGE EXAM FORMATS:');
    samples.forEach((college, index) => {
      console.log(`${index + 1}. ${college.name} (${college.stream})`);
      console.log(`   exam_accepted: "${college.exam_accepted}"`);
      console.log(`   type: ${typeof college.exam_accepted}`);
    });

    // Test the current filtering logic
    console.log('\n🧪 TESTING CURRENT FILTERING LOGIC:');
    
    // Test MPC + JEE Main query
    const mpcJeeMain = await College.find({
      stream: 'MPC',
      exam_accepted: 'JEE Main'
    }).limit(3);
    
    console.log(`\nMPC + JEE Main exact match: ${mpcJeeMain.length} colleges`);
    mpcJeeMain.forEach(college => {
      console.log(`  - ${college.name}: "${college.exam_accepted}"`);
    });

    // Check what exams contain "JEE Main"
    const containsJeeMain = await College.find({
      stream: 'MPC',
      exam_accepted: { $regex: 'JEE Main', $options: 'i' }
    }).limit(5);
    
    console.log(`\nMPC + contains "JEE Main": ${containsJeeMain.length} colleges`);
    containsJeeMain.forEach(college => {
      console.log(`  - ${college.name}: "${college.exam_accepted}"`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugExamFiltering();