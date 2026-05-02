#!/usr/bin/env node

const axios = require('axios');

async function testRegister() {
  try {
    const payload = {
      name: "Test User",
      business_name: "Test Business",
      email: `test${Date.now()}@example.com`,
      username: `test${Date.now()}`.substring(0, 10),
      password: "test12345",
      mobile_number: 12345678901,
      address: "Test Address",
      // NO BVN or NIN
    };

    console.log('Testing registration WITHOUT BVN/NIN...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('\nSending request to: https://web-production-a07e9.up.railway.app/api/users');

    const response = await axios.post(
      'https://web-production-a07e9.up.railway.app/api/users',
      payload
    );

    console.log('\n✅ SUCCESS!');
    console.log('Response:', response.data);

  } catch (error) {
    console.log('\n❌ ERROR!');
    console.log('Status:', error.response?.status);
    console.log('Error Message:', error.response?.data);
  }
}

testRegister();
