require('dotenv').config();
const axios = require('axios');

async function testSuperjaraWithNewHeader() {
  const token = process.env.SUPERJARA_AUTH_NEW_KEY;
  
  console.log('=== SUPERJARA API TEST ===');
  console.log('Token exists:', !!token);
  console.log('Token preview:', token ? token.substring(0, 15) + '...' : 'NOT SET');
  console.log('Endpoint: https://superjara.com/autobiz_vending_index.php');
  console.log('');

  if (!token) {
    console.error('ERROR: SUPERJARA_AUTH_NEW_KEY not set in .env file');
    return;
  }

  // Get our IP address first
  try {
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    console.log('Our IP Address:', ipResponse.data.ip);
    console.log('👆 WHITELIST THIS IP IN SUPERJARA');
    console.log('');
  } catch (error) {
    console.log('Could not get IP address');
  }

  // Test with new header format: "Bearer": token
  const req_header = {
    headers: {
      "Content-Type": "application/json",
      "Bearer": token,
      Accept: "application/json",
    },
  };

  const req_body = {
    product_code: "mtn_sme_1gb",
    phone_number: "08131635113",
    action: "vend",
    user_reference: "test-" + Date.now(),
  };

  console.log('Request Headers:', JSON.stringify({
    "Content-Type": "application/json",
    "Bearer": token.substring(0, 15) + '...',
    Accept: "application/json",
  }, null, 2));
  console.log('');
  console.log('Request Body:', JSON.stringify(req_body, null, 2));
  console.log('');

  try {
    const response = await axios.post(
      "https://superjara.com/autobiz_vending_index.php",
      req_body,
      req_header
    );

    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ ERROR!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

testSuperjaraWithNewHeader();
