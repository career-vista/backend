const fetch = require('node-fetch');

async function testAllStreams() {
  const testCases = [
    { stream: 'MPC', exam: 'JEE Main', rank: 5000, description: 'MPC Engineering' },
    { stream: 'MPC', exam: 'JEE Advanced', rank: 2000, description: 'MPC IIT' },
    { stream: 'BiPC', exam: 'NEET', rank: 10000, description: 'BiPC Medical' },
    { stream: 'MEC', exam: 'CUET', percentile: 85, description: 'MEC Commerce' },
    { stream: 'MEC', exam: 'IPMAT', percentile: 90, description: 'MEC Management' },
    { stream: 'CEC', exam: 'CLAT', rank: 500, description: 'CEC Law CLAT' },
    { stream: 'HEC', exam: 'CUET', percentile: 92, description: 'HEC Humanities' }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 TESTING: ${testCase.description}`);
    console.log('=' .repeat(50));
    
    try {
      const body = {
        stream: testCase.stream,
        exam: testCase.exam
      };
      
      if (testCase.rank) body.rank = testCase.rank;
      if (testCase.percentile) body.percentile = testCase.percentile;

      const response = await fetch('http://localhost:8080/api/college-predictor/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.log('❌ Error:', response.status);
        continue;
      }

      const data = await response.json();
      
      console.log(`✅ SUCCESS: ${data.summary.uniqueColleges} colleges, ${data.summary.totalPredictions} predictions`);
      console.log(`📊 Safe: ${data.summary.safeCount}, Moderate: ${data.summary.moderateCount}, Ambitious: ${data.summary.ambitiousCount}`);
      console.log(`💡 ${data.summary.explanation}`);
      
      // Show one sample prediction
      const allPredictions = [...data.predictions.safe, ...data.predictions.moderate, ...data.predictions.ambitious];
      if (allPredictions.length > 0) {
        const sample = allPredictions[0];
        console.log(`📝 Sample: ${sample.college.name} - ${sample.branch || 'General'} (${sample.category})`);
      }

    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
}

testAllStreams();