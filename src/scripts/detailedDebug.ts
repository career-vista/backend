import mongoose from 'mongoose';
import College from '../models/College';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

async function detailedDebug() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test specific scenarios that user reported
    const testCases = [
      { stream: 'MPC', exam: 'JEE Main', rank: 5000 },
      { stream: 'BiPC', exam: 'NEET', rank: 1000 },
      { stream: 'MEC', exam: 'CUET', percentile: 90 },
      { stream: 'CEC', exam: 'CLAT', rank: 200 },
      { stream: 'HEC', exam: 'CUET', percentile: 85 }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: ${testCase.stream} - ${testCase.exam}`);
      
      // Check if colleges exist for this stream and exam
      const colleges = await College.find({
        stream: testCase.stream,
        exam_accepted: { $regex: testCase.exam, $options: 'i' }
      });
      
      console.log(`   Found ${colleges.length} colleges for ${testCase.stream} + ${testCase.exam}`);
      
      if (colleges.length > 0) {
        console.log(`   Sample colleges:`);
        colleges.slice(0, 3).forEach((college, index) => {
          console.log(`     ${index + 1}. ${college.name} (${college.collegeType})`);
          if (college.branches && college.branches.length > 0) {
            const branch = college.branches[0];
            console.log(`        Branch: ${branch.name}, Cutoff: ${branch.closing_rank_min}-${branch.closing_rank_max}`);
          }
        });
        
        // Test prediction logic manually
        let predictions = 0;
        const inputValue = testCase.rank || testCase.percentile;
        const isRankBased = !!testCase.rank;
        
        if (inputValue) {
          for (const college of colleges) {
            if (college.branches && college.branches.length > 0) {
              for (const branch of college.branches) {
                if (isRankBased) {
                  // For rank-based (MPC, BiPC, CEC)
                  if (inputValue <= branch.closing_rank_max) {
                    predictions++;
                    break; // Count college once
                  }
                } else {
                  // For percentile-based (MEC, HEC) - need different logic
                  // Percentile 90 should be good enough for most colleges
                  if (testCase.percentile && testCase.percentile >= 80) { // Assume 80+ percentile is decent
                    predictions++;
                    break;
                  }
                }
              }
            }
          }
        }
        
        console.log(`   Predicted colleges with manual logic: ${predictions}`);
      } else {
        console.log(`   ❌ No colleges found for this combination`);
        
        // Check if it's an exact exam name match issue
        const allExamsForStream = await College.distinct('exam_accepted', { stream: testCase.stream });
        console.log(`   Available exams for ${testCase.stream}: ${allExamsForStream.join(', ')}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

detailedDebug();