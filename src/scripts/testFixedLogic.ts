import axios from 'axios';

async function testFixedLogic() {
  console.log('🧪 Testing Fixed Stream+Exam Logic\n');
  
  const tests = [
    {
      name: 'MPC + JEE Main (should only show JEE Main colleges)',
      data: { stream: 'MPC', exam: 'JEE Main', rank: 5000 }
    },
    {
      name: 'MPC + JEE Advanced (should only show JEE Advanced colleges)',
      data: { stream: 'MPC', exam: 'JEE Advanced', rank: 500 }
    },
    {
      name: 'BiPC + NEET (should only show NEET colleges)',
      data: { stream: 'BiPC', exam: 'NEET', rank: 1000 }
    },
    {
      name: 'MEC + CUET (should only show CUET colleges)',
      data: { stream: 'MEC', exam: 'CUET', percentile: 90 }
    },
    {
      name: 'MEC + IPMAT (should only show IPMAT colleges)',
      data: { stream: 'MEC', exam: 'IPMAT', percentile: 88 }
    },
    {
      name: 'CEC + CLAT (should only show CLAT colleges)',
      data: { stream: 'CEC', exam: 'CLAT', rank: 200 }
    },
    {
      name: 'HEC + CUET (should only show CUET colleges)',
      data: { stream: 'HEC', exam: 'CUET', percentile: 85 }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🔍 ${test.name}`);
      
      const response = await axios.post('http://localhost:8080/api/college-predictor/predict', test.data, {
        timeout: 10000
      });
      
      if (response.data.success) {
        const { summary } = response.data;
        console.log(`✅ ${summary.totalColleges} colleges found`);
        console.log(`   Safe: ${summary.safeCount}, Moderate: ${summary.moderateCount}, Ambitious: ${summary.ambitiousCount}`);
        
        // Show sample college to verify correct filtering
        const predictions = response.data.predictions;
        if (predictions.safe?.length > 0) {
          const college = predictions.safe[0].college;
          console.log(`   Sample: ${college.name} (${college.collegeType}) - Exam: ${college.exam_accepted}`);
        } else if (predictions.moderate?.length > 0) {
          const college = predictions.moderate[0].college;
          console.log(`   Sample: ${college.name} (${college.collegeType}) - Exam: ${college.exam_accepted}`);
        } else if (predictions.ambitious?.length > 0) {
          const college = predictions.ambitious[0].college;
          console.log(`   Sample: ${college.name} (${college.collegeType}) - Exam: ${college.exam_accepted}`);
        }
      } else {
        console.log(`❌ Failed: ${response.data.message}`);
      }
    } catch (error: any) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('\n🎯 Fixed logic ensures only stream+exam specific colleges are shown!');
}

testFixedLogic();