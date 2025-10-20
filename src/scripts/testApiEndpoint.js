const fetch = require('node-fetch');

async function testApiEndpoint() {
  try {
    const response = await fetch('http://localhost:8080/api/college-predictor/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stream: 'MPC',
        exam: 'JEE Main',
        rank: 5000
      })
    });

    if (!response.ok) {
      console.log('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('✅ API RESPONSE SUCCESS!');
    console.log('\n📊 SUMMARY:');
    console.log(`  - Unique Colleges: ${data.summary.uniqueColleges}`);
    console.log(`  - Total Predictions: ${data.summary.totalPredictions}`);
    console.log(`  - Explanation: ${data.summary.explanation}`);
    
    console.log('\n📈 BREAKDOWN:');
    console.log(`  - Safe: ${data.summary.safeCount} predictions`);
    console.log(`  - Moderate: ${data.summary.moderateCount} predictions`);
    console.log(`  - Ambitious: ${data.summary.ambitiousCount} predictions`);

    console.log('\n🎯 SAMPLE SAFE PREDICTIONS:');
    data.predictions.safe.slice(0, 3).forEach((pred, index) => {
      console.log(`${index + 1}. ${pred.college.name} - ${pred.branch || 'General'}`);
      console.log(`   Category: ${pred.category} (${pred.probability}% chance)`);
      console.log(`   Reason: ${pred.reason}`);
    });

    console.log('\n🟡 SAMPLE MODERATE PREDICTIONS:');
    data.predictions.moderate.slice(0, 3).forEach((pred, index) => {
      console.log(`${index + 1}. ${pred.college.name} - ${pred.branch || 'General'}`);
      console.log(`   Category: ${pred.category} (${pred.probability}% chance)`);
      console.log(`   Reason: ${pred.reason}`);
    });

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testApiEndpoint();