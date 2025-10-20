import mongoose from 'mongoose';
import College from '../models/College';

async function checkExamFormat() {
  try {
    await mongoose.connect('mongodb://localhost:27017/career-guidance');
    console.log('Connected to MongoDB');

    // Get a few sample colleges to see exam format
    const samples = await College.find({}).limit(5);
    
    console.log('\n🔍 SAMPLE COLLEGE EXAM FORMATS:');
    samples.forEach((college, index) => {
      console.log(`\n${index + 1}. ${college.name} (${college.stream})`);
      console.log(`   exam_accepted: "${college.exam_accepted}"`);
      console.log(`   type: ${typeof college.exam_accepted}`);
    });

    // Check unique exam formats
    const uniqueExams = await College.distinct('exam_accepted');
    console.log('\n📋 ALL UNIQUE EXAM VALUES:');
    uniqueExams.forEach((exam, index) => {
      console.log(`${index + 1}. "${exam}"`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkExamFormat();