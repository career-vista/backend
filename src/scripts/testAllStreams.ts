import axios from 'axios';

const API_URL = 'http://localhost:8080/api/college-predictor/predict';

async function testAllStreams() {
  console.log('🧪 Testing College Predictor with All 5 Streams\n');

  const tests = [
    {
      name: 'MPC - JEE Main',
      data: { stream: 'MPC', exam: 'JEE Main', rank: 5000 }
    },
    {
      name: 'MPC - JEE Advanced', 
      data: { stream: 'MPC', exam: 'JEE Advanced', rank: 1000 }
    },
    {
      name: 'BiPC - NEET',
      data: { stream: 'BiPC', exam: 'NEET', rank: 10000 }
    },
    {
      name: 'MEC - CUET',
      data: { stream: 'MEC', exam: 'CUET', percentile: 85 }
    },
    {
      name: 'MEC - IPMAT',
      data: { stream: 'MEC', exam: 'IPMAT', percentile: 90 }
    },
    {
      name: 'CEC - CLAT',
      data: { stream: 'CEC', exam: 'CLAT', rank: 500 }
    },
    {
      name: 'HEC - CUET',
      data: { stream: 'HEC', exam: 'CUET', percentile: 80 }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🔍 Testing: ${test.name}`);
      const response = await axios.post(API_URL, test.data);
      
      if (response.data.success) {
        const { predictions, summary } = response.data;
        console.log(`✅ SUCCESS: ${summary.totalColleges} colleges found`);
        console.log(`   Safe: ${summary.safeCount}, Moderate: ${summary.moderateCount}, Ambitious: ${summary.ambitiousCount}`);
        
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
      } else {
        console.log(`❌ FAILED: ${response.data.message}`);
      }
    } catch (error: any) {
      console.log(`❌ ERROR: ${error.response?.data?.message || error.message}`);
    }
  }

  console.log('\n🎉 All stream tests completed!');
}

testAllStreams();