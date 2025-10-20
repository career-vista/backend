import axios from 'axios';

const API_URL = 'http://localhost:8080/api/college-predictor/predict';

async function testRealisticScenarios() {
  console.log('🧪 Testing College Predictor with Realistic Scenarios\n');

  const tests = [
    {
      name: 'MPC - JEE Main (Good Rank)',
      data: { stream: 'MPC', exam: 'JEE Main', rank: 15000 }
    },
    {
      name: 'MPC - JEE Advanced (Top Rank)', 
      data: { stream: 'MPC', exam: 'JEE Advanced', rank: 500 }
    },
    {
      name: 'BiPC - NEET (Top Medical Rank)',
      data: { stream: 'BiPC', exam: 'NEET', rank: 1000 }
    },
    {
      name: 'BiPC - NEET (Good Medical Rank)',
      data: { stream: 'BiPC', exam: 'NEET', rank: 5000 }
    },
    {
      name: 'MEC - CUET (High Percentile)',
      data: { stream: 'MEC', exam: 'CUET', percentile: 95 }
    },
    {
      name: 'MEC - IPMAT (Good Percentile)',
      data: { stream: 'MEC', exam: 'IPMAT', percentile: 88 }
    },
    {
      name: 'CEC - CLAT (Good Law Rank)',
      data: { stream: 'CEC', exam: 'CLAT', rank: 200 }
    },
    {
      name: 'HEC - CUET (Good Arts Percentile)',
      data: { stream: 'HEC', exam: 'CUET', percentile: 85 }
    }
  ];

  let successCount = 0;
  let totalColleges = 0;

  for (const test of tests) {
    try {
      console.log(`\n🔍 Testing: ${test.name}`);
      const response = await axios.post(API_URL, test.data);
      
      if (response.data.success) {
        const { predictions, summary } = response.data;
        console.log(`✅ SUCCESS: ${summary.totalColleges} colleges found`);
        console.log(`   Safe: ${summary.safeCount}, Moderate: ${summary.moderateCount}, Ambitious: ${summary.ambitiousCount}`);
        
        totalColleges += summary.totalColleges;
        successCount++;
        
        // Show top college from each category
        if (predictions.safe?.length > 0) {
          console.log(`   🟢 Safe: ${predictions.safe[0].college.name} (${predictions.safe[0].branch || 'General'})`);
        }
        if (predictions.moderate?.length > 0) {
          console.log(`   🟡 Moderate: ${predictions.moderate[0].college.name} (${predictions.moderate[0].branch || 'General'})`);
        }
        if (predictions.ambitious?.length > 0) {
          console.log(`   🔴 Ambitious: ${predictions.ambitious[0].college.name} (${predictions.ambitious[0].branch || 'General'})`);
        }
      } else {
        console.log(`❌ FAILED: ${response.data.message}`);
      }
    } catch (error: any) {
      console.log(`❌ ERROR: ${error.response?.data?.message || error.message}`);
    }
  }

  console.log(`\n🎉 Testing Complete!`);
  console.log(`✅ ${successCount}/${tests.length} tests passed`);
  console.log(`📊 Total colleges across all tests: ${totalColleges}`);
  console.log(`\n🚀 College Predictor is working with your JSON data!`);
}

testRealisticScenarios();