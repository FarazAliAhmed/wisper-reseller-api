#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const PAYMENTPOINT_BASE_URL = process.env.PAYMENTPOINT_BASE_URL || 'https://api.paymentpoint.co';
const PAYMENTPOINT_API_KEY = process.env.PAYMENTPOINT_API_KEY;
const PAYMENTPOINT_SECRET_KEY = process.env.PAYMENTPOINT_SECRET_KEY;
const BUSINESS_ID = '71e885f182ed5ea4454ef5e1d7e9a2ec40d11b36';

console.log('='.repeat(80));
console.log('PaymentPoint Direct API Test');
console.log('='.repeat(80));
console.log('Base URL:', PAYMENTPOINT_BASE_URL);
console.log('API Key:', PAYMENTPOINT_API_KEY ? `${PAYMENTPOINT_API_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('Secret Key:', PAYMENTPOINT_SECRET_KEY ? `${PAYMENTPOINT_SECRET_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('Business ID:', BUSINESS_ID);
console.log('='.repeat(80));

async function testCreateVirtualAccount() {
  try {
    console.log('\nTesting: Create Virtual Account');
    console.log('-'.repeat(80));

    const payload = {
      email: `test${Date.now()}@example.com`,
      name: 'Test User PaymentPoint',
      phoneNumber: '08012345678',
      bankCode: ['20946', '20897'],
      businessId: BUSINESS_ID
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${PAYMENTPOINT_BASE_URL}/api/v1/createVirtualAccount`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAYMENTPOINT_SECRET_KEY}`,
          'api-key': PAYMENTPOINT_API_KEY
        }
      }
    );

    console.log('\n✅ SUCCESS!');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data.bankAccounts) {
      console.log('\n📋 Bank Accounts Created:');
      response.data.bankAccounts.forEach((account, index) => {
        console.log(`\n${index + 1}. ${account.bankName}`);
        console.log(`   Account Number: ${account.accountNumber}`);
        console.log(`   Account Name: ${account.accountName}`);
      });
    }

    return response.data;

  } catch (error) {
    console.log('\n❌ ERROR!');
    console.log('Status:', error.response?.status);
    console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Error Message:', error.message);
    return null;
  }
}

async function runTest() {
  if (!PAYMENTPOINT_API_KEY || !PAYMENTPOINT_SECRET_KEY) {
    console.log('\n❌ ERROR: PaymentPoint credentials not found in .env file!');
    console.log('Please ensure PAYMENTPOINT_API_KEY and PAYMENTPOINT_SECRET_KEY are set.');
    process.exit(1);
  }

  await testCreateVirtualAccount();

  console.log('\n' + '='.repeat(80));
  console.log('Test completed!');
  console.log('='.repeat(80));
}

runTest();
