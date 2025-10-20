import mongoose from 'mongoose';
import College from '../models/College';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

async function debugBiPC() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('🔍 DEBUGGING BiPC ISSUE:\n');

    // Check BiPC colleges
    const bipcColleges = await College.find({ stream: 'BiPC' });
    console.log(`Total BiPC colleges: ${bipcColleges.length}`);

    if (bipcColleges.length > 0) {
      console.log('\n📋 SAMPLE BiPC COLLEGES:');
      bipcColleges.slice(0, 5).forEach((college, index) => {
        console.log(`${index + 1}. ${college.name}`);
        console.log(`   Exam: ${college.exam_accepted}`);
        console.log(`   Closing rank: ${college.closing_rank}`);
        console.log(`   Branches: ${college.branches?.length || 0}`);
      });

      // Test the filtering logic
      console.log('\n🧪 TESTING NEET FILTER:');
      const neetColleges = await College.find({
        stream: 'BiPC',
        exam_accepted: 'NEET'
      });
      console.log(`BiPC + NEET colleges: ${neetColleges.length}`);

      if (neetColleges.length > 0) {
        console.log('\nSample NEET college:');
        const sample = neetColleges[0];
        console.log(`Name: ${sample.name}`);
        console.log(`Exam: ${sample.exam_accepted}`);
        console.log(`Closing rank: ${sample.closing_rank}`);
        
        // Parse rank to check format
        if (sample.closing_rank) {
          console.log(`Rank type: ${typeof sample.closing_rank}`);
          console.log(`Rank value: "${sample.closing_rank}"`);
        }
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugBiPC();