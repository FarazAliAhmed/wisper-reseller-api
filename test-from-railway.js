// Test Superjara API from Railway server (after IP whitelist)
const axios = require('axios');

async function testFromRailway() {
  const token = 'zXTgJqLSb8wJ0VUpa7iIQpUDWN5MxaF2qruCsHg5Z8XVOcAa1JEVKRQqb8q8ChCs';
  
  console.log('Testing Superjara from Railway IP (34.6.211.14)...');
  
  try {
    const response = await axios.post(
      "https://www.superjara.com/api/data/",
      {
        product_code: "data_share_1gb",
        phone_number: "08131635113",
        action: "vend",
        user_reference: "railway-test-" + Date.now(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
          Accept: "application/json",
        },
      }
    );

    console.log('SUCCESS!');
    return response.data;
  } catch (error) {
    console.log('ERROR!');
    console.log('Status:', error?.response?.status);
    console.log('Error:', error?.response?.data);
    return error?.response?.data;
  }
}

module.exports = { testFromRailway };
