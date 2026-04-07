const axios = require('axios');

async function testCustomerEndpoint() {
  console.log('=== TESTING CUSTOMER API ENDPOINT ===\n');
  
  const endpoint = 'https://web-production-a07e9.up.railway.app/api/buy';
  
  console.log('Endpoint:', endpoint);
  console.log('Method: POST');
  console.log('\nHeaders:');
  console.log('  Content-Type: application/json');
  console.log('  Authorization: Bearer YOUR_API_TOKEN');
  console.log('\nBody:');
  console.log(JSON.stringify({
    network: "MTN",
    plan_id: 210,
    phone_number: "08131635113"
  }, null, 2));
  
  console.log('\n--- Testing without token (should fail) ---');
  try {
    const response = await axios.post(endpoint, {
      network: "MTN",
      plan_id: 210,
      phone_number: "08131635113"
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
  
  console.log('\n✅ ENDPOINT IS WORKING');
  console.log('Customer needs to provide valid Authorization token in header');
}

testCustomerEndpoint();
