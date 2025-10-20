const fetch = require('node-fetch');

async function testBiPCWithDifferentRanks() {
  const ranks = [50, 500, 5000, 15000, 50000];
  
  for (const rank of ranks) {
    console.log(`\n🧪 TESTING BiPC with NEET rank ${rank}:`);
    
    try {
      const response = await fetch('http://localhost:8080/api/college-predictor/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stream: 'BiPC',
          exam: 'NEET',
          rank: rank
        })
      });

      if (!response.ok) {
        console.log('❌ Error:', response.status);
        continue;
      }

      const data = await response.json();
      
      console.log(`✅ Colleges: ${data.summary.uniqueColleges}, Predictions: ${data.summary.totalPredictions}`);
      console.log(`📊 Safe: ${data.summary.safeCount}, Moderate: ${data.summary.moderateCount}, Ambitious: ${data.summary.ambitiousCount}`);
      
      if (data.summary.totalPredictions > 0) {
        const allPredictions = [...data.predictions.safe, ...data.predictions.moderate, ...data.predictions.ambitious];
        const sample = allPredictions[0];
        console.log(`📝 Sample: ${sample.college.name} - ${sample.branch} (${sample.category})`);
        console.log(`   ${sample.reason}`);
      }

    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
}

testBiPCWithDifferentRanks();