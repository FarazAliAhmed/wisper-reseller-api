require('dotenv').config();
const axios = require('axios');

// Test Superjara API directly without hitting our backend
async function testSuperjaraAPI() {
  const superjara_token = process.env.SUPERJARA_AUTH_NEW_KEY;
  const superjara_url = "https://www.superjara.com/api/data/";

  console.log('Testing Superjara API...');
  console.log('Token exists:', !!superjara_token);
  console.log('Token length:', superjara_token?.length);
  console.log('URL:', superjara_url);
  console.log('---');

  try {
    const req_header = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${superjara_token}`,
        Accept: "application/json",
      },
    };

    const req_body = {
      product_code: "data_share_1gb",
      phone_number: "08131635113",
      action: "vend",
      user_reference: "test-" + Date.now(),
    };

    console.log('Request Body:', JSON.stringify(req_body, null, 2));
    console.log('Request Headers:', JSON.stringify({
      ...req_header.headers,
      Authorization: `Token ${superjara_token.substring(0, 10)}...`
    }, null, 2));
    console.log('---');

    const response = await axios.post(
      superjara_url,
      req_body,
      req_header
    );

    console.log('SUCCESS!');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.log('ERROR!');
    console.log('Status:', error?.response?.status);
    console.log('Response Data:', JSON.stringify(error?.response?.data, null, 2));
    console.log('Error Message:', error.message);
    
    return null;
  }
}

testSuperjaraAPI();
