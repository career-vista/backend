import axios from 'axios';

async function testDirectAPI() {
  console.log('🧪 Testing API directly...\n');
  
  try {
    const testData = {
      stream: 'MPC',
      exam: 'JEE Main',
      rank: 5000
    };
    
    console.log('📤 Sending request to: http://localhost:8080/api/college-predictor/predict');
    console.log('📝 Request data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:8080/api/college-predictor/predict', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Response received!');
    console.log('📋 Status:', response.status);
    console.log('📊 Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const { summary } = response.data;
      console.log(`\n🎯 RESULT: ${summary.totalColleges} colleges found!`);
      console.log(`   Safe: ${summary.safeCount}`);
      console.log(`   Moderate: ${summary.moderateCount}`);
      console.log(`   Ambitious: ${summary.ambitiousCount}`);
    }
    
  } catch (error: any) {
    console.log('❌ Error occurred:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('   No response received from server');
      console.log('   Request:', error.request);
    } else {
      console.log('   Error:', error.message);
    }
    console.log('   Code:', error.code);
  }
}

testDirectAPI();