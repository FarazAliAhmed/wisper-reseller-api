const axios = require('axios');

const API_URL = 'https://web-production-a07e9.up.railway.app/api';

async function testSuperjaraAPI() {
  try {
    console.log('🧪 Testing Superjara MTN Data Purchase...\n');
    
    // Test with a small data plan
    const testData = {
      network: "mtn",
      mobile_number: "08131635113",
      plan_id: "52",
      bypass: false
    };
    
    console.log('Test Request:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\nSending request to Railway API...\n');
    
    const response = await axios.post(
      `${API_URL}/buy`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '742a3e3c-86ea-4389-bcf8-76a22b0636da' // octasub's access_token
        }
      }
    );
    
    console.log('✅ SUCCESS! Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ ERROR:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testSuperjaraAPI();
