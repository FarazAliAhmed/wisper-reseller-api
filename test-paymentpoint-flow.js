#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'https://web-production-a07e9.up.railway.app/api';
const TEST_USER = {
  email: 'test1777671321387@example.com',
  password: 'test12345'
};

let authToken = '';

async function login() {
  try {
    console.log('1. Testing Login...');
    const response = await axios.post(`${API_URL}/auth`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    authToken = response.data;
    console.log('✅ Login successful!');
    console.log('Token:', authToken.substring(0, 50) + '...\n');
    return true;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function checkAccountDetails() {
  try {
    console.log('2. Checking PaymentPoint account details...');
    const response = await axios.get(`${API_URL}/paymentpoint/account-details`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    console.log('✅ Account details retrieved!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('ℹ️  No PaymentPoint account found (expected for new user)\n');
      return null;
    }
    console.log('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function createVirtualAccount() {
  try {
    console.log('3. Creating PaymentPoint virtual account...');
    const response = await axios.post(
      `${API_URL}/paymentpoint/create-account`,
      {
        accountName: 'Test User'
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    console.log('✅ Virtual account created!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log('❌ Create account failed:', error.response?.data || error.message);
    return null;
  }
}

async function getTransactionHistory() {
  try {
    console.log('\n4. Getting transaction history...');
    const response = await axios.get(`${API_URL}/paymentpoint/history?limit=10`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    console.log('✅ Transaction history retrieved!');
    console.log('Transactions:', response.data.transactions?.length || 0);
    if (response.data.transactions?.length > 0) {
      console.log('Latest transaction:', JSON.stringify(response.data.transactions[0], null, 2));
    }
    return response.data;
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function runTest() {
  console.log('='.repeat(80));
  console.log('PaymentPoint Integration Test');
  console.log('='.repeat(80));
  console.log(`API URL: ${API_URL}`);
  console.log(`Test User: ${TEST_USER.email}\n`);

  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Test failed at login step');
    process.exit(1);
  }

  // Step 2: Check existing account
  const accountDetails = await checkAccountDetails();

  // Step 3: Create account if doesn't exist
  if (!accountDetails) {
    console.log('Creating new PaymentPoint account...\n');
    const createResult = await createVirtualAccount();
    
    if (createResult) {
      console.log('\n✅ Account creation successful!');
      
      // Check account details again
      await checkAccountDetails();
    }
  } else {
    console.log('✅ User already has PaymentPoint account');
  }

  // Step 4: Get transaction history
  await getTransactionHistory();

  console.log('\n' + '='.repeat(80));
  console.log('Test completed!');
  console.log('='.repeat(80));
}

runTest();
