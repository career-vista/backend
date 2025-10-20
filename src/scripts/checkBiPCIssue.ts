import mongoose from 'mongoose';
import College from '../models/College';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

async function checkBiPCIssue() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check BiPC colleges
    const bipcColleges = await College.find({ stream: 'BiPC' });
    console.log(`BiPC colleges found: ${bipcColleges.length}`);

    if (bipcColleges.length > 0) {
      console.log('\nSample BiPC college:');
      const sample = bipcColleges[0];
      console.log(`Name: ${sample.name}`);
      console.log(`Stream: ${sample.stream}`);
      console.log(`Exam: ${sample.exam_accepted}`);
      console.log(`Type: ${sample.collegeType}`);
      console.log(`Branches: ${JSON.stringify(sample.branches?.slice(0, 2), null, 2)}`);

      // Test a NEET prediction manually
      console.log('\n🧪 Testing NEET rank 10000 against BiPC colleges...');
      
      for (let i = 0; i < Math.min(3, bipcColleges.length); i++) {
        const college = bipcColleges[i];
        console.log(`\nCollege: ${college.name}`);
        console.log(`Branches available: ${college.branches?.length || 0}`);
        
        if (college.branches && college.branches.length > 0) {
          for (const branch of college.branches.slice(0, 2)) {
            console.log(`  Branch: ${branch.name}`);
            console.log(`  Closing rank min: ${branch.closing_rank_min}`);
            console.log(`  Closing rank max: ${branch.closing_rank_max}`);
            
            const rank = 10000;
            if (rank <= branch.closing_rank_max) {
              if (rank <= branch.closing_rank_min * 0.7) {
                console.log(`  ✅ SAFE (rank ${rank} << ${branch.closing_rank_min})`);
              } else if (rank <= branch.closing_rank_min) {
                console.log(`  🟡 MODERATE (rank ${rank} <= ${branch.closing_rank_min})`);
              } else {
                console.log(`  🔴 AMBITIOUS (rank ${rank} > ${branch.closing_rank_min})`);
              }
            } else {
              console.log(`  ❌ NOT ELIGIBLE (rank ${rank} > max ${branch.closing_rank_max})`);
            }
          }
        } else {
          console.log('  No branches data available');
        }
      }
    } else {
      console.log('❌ No BiPC colleges found in database!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkBiPCIssue();