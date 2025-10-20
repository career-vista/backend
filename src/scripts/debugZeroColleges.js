const fetch = require('node-fetch');

async function debugZeroColleges() {
  console.log('🔍 DEBUGGING ZERO COLLEGES ISSUE\n');
  
  const testCases = [
    { stream: 'MPC', exam: 'JEE Main', rank: 5000, description: 'MPC JEE Main' },
    { stream: 'MPC', exam: 'JEE Advanced', rank: 2000, description: 'MPC JEE Advanced' },
    { stream: 'BiPC', exam: 'NEET', rank: 500, description: 'BiPC NEET' },
    { stream: 'MEC', exam: 'CUET', percentile: 85, description: 'MEC CUET' },
    { stream: 'MEC', exam: 'IPMAT', percentile: 90, description: 'MEC IPMAT' },
    { stream: 'CEC', exam: 'CLAT', rank: 500, description: 'CEC CLAT' },
    { stream: 'HEC', exam: 'CUET', percentile: 92, description: 'HEC CUET' }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 TESTING: ${testCase.description}`);
    console.log('=' .repeat(40));
    
    try {
      const body = {
        stream: testCase.stream,
        exam: testCase.exam
      };
      
      if (testCase.rank) body.rank = testCase.rank;
      if (testCase.percentile) body.percentile = testCase.percentile;

      console.log('Request body:', JSON.stringify(body, null, 2));

      const response = await fetch('http://localhost:8080/api/college-predictor/predict', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ ERROR RESPONSE:', errorText);
        continue;
      }

      const data = await response.json();
      
      console.log('✅ SUCCESS');
      console.log(`  - Unique Colleges: ${data.summary.uniqueColleges}`);
      console.log(`  - Total Predictions: ${data.summary.totalPredictions}`);
      console.log(`  - Safe: ${data.summary.safeCount}, Moderate: ${data.summary.moderateCount}, Ambitious: ${data.summary.ambitiousCount}`);
      console.log(`  - Explanation: ${data.summary.explanation}`);
      
      if (data.summary.totalPredictions === 0) {
        console.log('⚠️  ZERO PREDICTIONS - Need to investigate!');
      }

    } catch (error) {
      console.log('❌ NETWORK ERROR:', error.message);
    }
  }
}

debugZeroColleges();