#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://web-production-a07e9.up.railway.app/api';

async function testChisomAccount() {
  try {
    console.log('Testing Chisom Account API...\n');
    
    // Login as Chisom
    console.log('1. Logging in as chisomalaoma@gmail.com...');
    
    // Try common passwords
    const passwords = ['Kachi@123'];
    let token = null;
    
    for (const password of passwords) {
      try {
        const loginResponse = await axios.post(`${API_URL}/auth`, {
          email: 'chisomalaoma@gmail.com',
          password: password
        });
        token = loginResponse.data;
        console.log(`✅ Login successful with password: ${password}\n`);
        break;
      } catch (err) {
        // Try next password
      }
    }

    if (!token) {
      console.log('❌ Could not login with any common password');
      console.log('Please provide the correct password for chisomalaoma@gmail.com\n');
      return;
    }

    // Test account-details endpoint
    console.log('2. Fetching account details...');
    try {
      const response = await axios.get(
        `${API_URL}/paymentpoint/account-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('✅ Account details retrieved!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ Error fetching account details:');
      console.log('Status:', error.response?.status);
      console.log('Error:', JSON.stringify(error.response?.data, null, 2));
    }

    // Test transaction history
    console.log('\n3. Fetching transaction history...');
    try {
      const response = await axios.get(
        `${API_URL}/paymentpoint/history?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('✅ Transaction history retrieved!');
      console.log('Transactions:', response.data.transactions?.length || 0);
      
    } catch (error) {
      console.log('❌ Error fetching transaction history:');
      console.log('Status:', error.response?.status);
      console.log('Error:', JSON.stringify(error.response?.data, null, 2));
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testChisomAccount();
