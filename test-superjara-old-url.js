require('dotenv').config();
const axios = require('axios');

// Test with the OLD URL from error logs
async function testOldURL() {
  const superjara_token = process.env.SUPERJARA_AUTH_NEW_KEY;
  const old_url = "https://superjara.com/autobiz_vending_index.php";

  console.log('Testing OLD Superjara URL...');
  console.log('URL:', old_url);
  console.log('---');

  try {
    const response = await axios.post(
      old_url,
      {
        product_code: "data_share_1gb",
        phone_number: "08131635113",
        action: "vend",
        user_reference: "test-" + Date.now(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${superjara_token}`,
          Accept: "application/json",
        },
      }
    );

    console.log('SUCCESS with OLD URL!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('ERROR with OLD URL!');
    console.log('Status:', error?.response?.status);
    console.log('Response:', JSON.stringify(error?.response?.data, null, 2));
  }

  console.log('\n---\nNow testing NEW URL...');
  
  try {
    const response = await axios.post(
      "https://www.superjara.com/api/data/",
      {
        product_code: "data_share_1gb",
        phone_number: "08131635113",
        action: "vend",
        user_reference: "test-" + Date.now(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${superjara_token}`,
          Accept: "application/json",
        },
      }
    );

    console.log('SUCCESS with NEW URL!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('ERROR with NEW URL!');
    console.log('Status:', error?.response?.status);
    console.log('Response:', JSON.stringify(error?.response?.data, null, 2));
  }
}

testOldURL();
