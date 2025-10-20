import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

const API_URL = process.env.COLLEGE_PREDICTOR_API_URL as string;
if (!API_URL) {
  console.error('COLLEGE_PREDICTOR_API_URL is not set in environment variables.');
  process.exit(1);
}

async function debugPredictionIssues() {
  console.log('🔍 Debugging College Prediction Issues\n');

  const tests = [
    {
      name: 'MPC + JEE Main + Rank 5000',
      data: { stream: 'MPC', exam: 'JEE Main', rank: 5000 }
    },
    {
      name: 'BiPC + NEET + Rank 1000',
      data: { stream: 'BiPC', exam: 'NEET', rank: 1000 }
    },
    {
      name: 'MEC + CUET + Percentile 90',
      data: { stream: 'MEC', exam: 'CUET', percentile: 90 }
    },
    {
      name: 'CEC + CLAT + Rank 200',
      data: { stream: 'CEC', exam: 'CLAT', rank: 200 }
    },
    {
      name: 'HEC + CUET + Percentile 85',
      data: { stream: 'HEC', exam: 'CUET', percentile: 85 }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      console.log(`   Request: ${JSON.stringify(test.data)}`);
      
      const response = await axios.post(API_URL, test.data);
      
      if (response.data.success) {
        const { predictions, summary } = response.data;
        console.log(`✅ SUCCESS: ${summary.totalColleges} colleges found`);
        console.log(`   Safe: ${summary.safeCount}, Moderate: ${summary.moderateCount}, Ambitious: ${summary.ambitiousCount}`);
        
        if (summary.totalColleges === 0) {
          console.log(`❌ ISSUE: No colleges found for this combination`);
        } else {
          // Show sample colleges
          if (predictions.safe?.length > 0) {
            console.log(`   Sample Safe: ${predictions.safe[0].college.name}`);
          }
          if (predictions.moderate?.length > 0) {
            console.log(`   Sample Moderate: ${predictions.moderate[0].college.name}`);
          }
          if (predictions.ambitious?.length > 0) {
            console.log(`   Sample Ambitious: ${predictions.ambitious[0].college.name}`);
          }
        }
      } else {
        console.log(`❌ FAILED: ${response.data.message}`);
      }
    } catch (error: any) {
      console.log(`❌ ERROR: ${error.response?.data?.message || error.message}`);
    }
  }

  console.log('\n🔍 Debugging complete!');
}

debugPredictionIssues();