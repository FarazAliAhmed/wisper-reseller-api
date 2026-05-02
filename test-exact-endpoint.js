#!/usr/bin/env node

const axios = require('axios');

async function testExactEndpoint() {
  try {
    console.log('Testing exact endpoint that is failing...\n');
    
    // First, login to get a fresh token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(
      'https://web-production-a07e9.up.railway.app/api/auth',
      {
        email: 'chisomalaoma@gmail.com',
        password: 'Kachi@123'
      }
    );

    const token = loginResponse.data;
    console.log('✅ Login successful');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...\n');

    // Now test the account-details endpoint
    console.log('2. Testing /api/paymentpoint/account-details...');
    try {
      const response = await axios.get(
        'https://web-production-a07e9.up.railway.app/api/paymentpoint/account-details',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('✅ SUCCESS!');
      console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
      console.log('❌ FAILED!');
      console.log('Status:', error.response?.status);
      console.log('Error:', JSON.stringify(error.response?.data, null, 2));
      console.log('\nFull error response:');
      console.log(error.response?.data);
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
  }
}

testExactEndpoint();
