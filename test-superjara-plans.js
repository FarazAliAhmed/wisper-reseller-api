require('dotenv').config();
const axios = require('axios');

// Test Superjara API - Check available plans
async function testSuperjaraPlans() {
  const superjara_token = process.env.SUPERJARA_AUTH_NEW_KEY;

  console.log('Testing Superjara API - Get Plans...');
  console.log('Token exists:', !!superjara_token);
  console.log('---');

  try {
    // Try to get available data plans
    const response = await axios.get(
      "https://www.superjara.com/api/data/",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${superjara_token}`,
          Accept: "application/json",
        },
      }
    );

    console.log('SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('ERROR!');
    console.log('Status:', error?.response?.status);
    console.log('Response:', JSON.stringify(error?.response?.data, null, 2));
  }
}

testSuperjaraPlans();
