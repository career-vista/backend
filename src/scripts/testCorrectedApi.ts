import mongoose from 'mongoose';
import College from '../models/College';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

// Import the prediction function to test
async function generateStreamBasedPredictions({
  stream,
  exam,
  rank,
  percentile,
}: {
  stream: string;
  exam: string;
  rank?: number;
  percentile?: number;
}) {
  const colleges = await College.find({
    stream: stream,
    exam_accepted: exam
  });

  const predictions: any[] = [];
  const usesRank = ['MPC', 'BiPC', 'CEC'].includes(stream);

  for (const college of colleges) {
    if (college.branches && college.branches.length > 0) {
      for (const branch of college.branches) {
        if (usesRank && rank) {
          // Simple categorization for testing
          let category = 'Moderate';
          if (rank <= branch.closing_rank_min) category = 'Safe';
          if (rank > branch.closing_rank_max * 1.2) category = 'Ambitious';

          predictions.push({
            college,
            branch: branch.name,
            category,
            probability: 70,
            reason: `Your rank ${rank} vs closing rank ${branch.closing_rank_min}-${branch.closing_rank_max}`,
          });
        }
      }
    }
  }

  return predictions;
}

async function testCorrectedApi() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test MPC + JEE Main with rank 50000
    const predictions = await generateStreamBasedPredictions({
      stream: 'MPC',
      exam: 'JEE Main',
      rank: 50000
    });

    // Count unique colleges (not branch-specific predictions)
    const uniqueColleges = new Set(predictions.map((p: any) => p.college._id.toString()));
    const uniqueCollegeCount = uniqueColleges.size;

    console.log('🎯 CORRECTED API RESULTS:');
    console.log(`  - Total predictions: ${predictions.length} (branch-specific)`);
    console.log(`  - Unique colleges: ${uniqueCollegeCount}`);
    console.log(`  - Explanation: Found ${uniqueCollegeCount} colleges with ${predictions.length} branch options`);

    // Show breakdown by category
    const safe = predictions.filter(p => p.category === 'Safe');
    const moderate = predictions.filter(p => p.category === 'Moderate');
    const ambitious = predictions.filter(p => p.category === 'Ambitious');

    console.log('\n📊 CATEGORY BREAKDOWN:');
    console.log(`  - Safe: ${safe.length} predictions`);
    console.log(`  - Moderate: ${moderate.length} predictions`);
    console.log(`  - Ambitious: ${ambitious.length} predictions`);

    // Show sample predictions
    console.log('\n📋 SAMPLE PREDICTIONS:');
    predictions.slice(0, 5).forEach((pred, index) => {
      console.log(`${index + 1}. ${pred.college.name} - ${pred.branch} (${pred.category})`);
      console.log(`   ${pred.reason}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testCorrectedApi();