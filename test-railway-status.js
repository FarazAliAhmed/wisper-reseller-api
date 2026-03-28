const axios = require('axios');

async function testRailwayStatus() {
  try {
    console.log('🔍 Checking Railway API status...\n');
    
    // Test 1: Health check
    const healthCheck = await axios.get('https://web-production-a07e9.up.railway.app/');
    console.log('✅ Health Check:', healthCheck.data);
    
    // Test 2: Get plans (should work)
    const plansCheck = await axios.get('https://web-production-a07e9.up.railway.app/api/plans');
    console.log(`✅ Plans API: ${plansCheck.data.length} plans available\n`);
    
    console.log('Railway API is responding correctly!');
    console.log('You can now test the data purchase.');
    
  } catch (error) {
    console.error('❌ Railway API Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data);
    } else {
      console.error(error.message);
    }
    console.log('\n⏳ Railway might still be deploying. Wait 2-3 minutes and try again.');
  }
}

testRailwayStatus();
