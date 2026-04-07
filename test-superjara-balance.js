require('dotenv').config();
const axios = require('axios');

async function testSuperjaraBalance() {
  const token = process.env.SUPERJARA_AUTH_NEW_KEY;
  
  console.log('=== SUPERJARA BALANCE CHECK ===');
  
  const req_header = {
    headers: {
      "Content-Type": "application/json",
      "Bearer": token,
      Accept: "application/json",
    },
  };

  const req_body = {
    action: "balance"
  };

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

testSuperjaraBalance();
