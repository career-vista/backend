import mongoose from 'mongoose';
import College from '../models/College';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

async function testApiLogic() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test the exact logic that the API uses
    const stream = 'MPC';
    const exam = 'JEE Main';
    const rank = 50000;

    console.log(`🧪 TESTING API LOGIC: ${stream} + ${exam} with rank ${rank}`);

    // This is the exact query from generateStreamBasedPredictions
    const colleges = await College.find({
      stream: stream,
      exam_accepted: exam
    });

    console.log(`Found ${colleges.length} colleges`);

    // Show first few colleges
    console.log('\n📋 FIRST 5 COLLEGES:');
    colleges.slice(0, 5).forEach((college, index) => {
      console.log(`${index + 1}. ${college.name} (${college.type})`);
      console.log(`   Stream: ${college.stream}, Exam: ${college.exam_accepted}`);
      if (college.branches && college.branches.length > 0) {
        console.log(`   Branches: ${college.branches.length}`);
        console.log(`   Sample branch: ${college.branches[0]?.name} (${college.branches[0]?.closing_rank_min}-${college.branches[0]?.closing_rank_max})`);
      } else {
        console.log(`   No branches, closing_rank: ${college.closing_rank}`);
      }
    });

    // Count colleges with branches vs without
    const withBranches = colleges.filter(c => c.branches && c.branches.length > 0);
    const withoutBranches = colleges.filter(c => !c.branches || c.branches.length === 0);

    console.log(`\n📊 BREAKDOWN:`);
    console.log(`  - Colleges with branches: ${withBranches.length}`);
    console.log(`  - Colleges without branches: ${withoutBranches.length}`);

    // Count total predictions that would be generated
    let totalPredictions = 0;
    for (const college of colleges) {
      if (college.branches && college.branches.length > 0) {
        totalPredictions += college.branches.length;
      } else {
        totalPredictions += 1;
      }
    }

    console.log(`  - Total predictions that would be generated: ${totalPredictions}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testApiLogic();