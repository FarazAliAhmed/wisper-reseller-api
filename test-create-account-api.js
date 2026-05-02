#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://web-production-a07e9.up.railway.app/api';

async function testCreateAccount() {
  try {
    // First login
    console.log('1. Logging in as chisomalaoma@gmail.com...');
    const loginResponse = await axios.post(`${API_URL}/auth`, {
      email: 'chisomalaoma@gmail.com',
      password: 'Wisper@2024' // You'll need to provide the correct password
    });

    const token = loginResponse.data;
    console.log('✅ Login successful\n');

    // Try to create PaymentPoint account
    console.log('2. Creating PaymentPoint virtual account...');
    const createResponse = await axios.post(
      `${API_URL}/paymentpoint/create-account`,
      {
        accountName: 'Chisom Alaoma'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Account created successfully!');
    console.log('Response:', JSON.stringify(createResponse.data, null, 2));

  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  Authentication failed. Please check the password.');
    }
  }
}

testCreateAccount();
