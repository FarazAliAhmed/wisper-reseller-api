#!/usr/bin/env node

const axios = require('axios');

async function testEnvVars() {
  try {
    console.log('Testing if PaymentPoint environment variables are set on Railway...\n');
    
    // Test a simple endpoint that will show if env vars are missing
    const response = await axios.get('https://web-production-a07e9.up.railway.app/api/auth/');
    
    console.log('✅ Backend is running');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('Backend status:', error.response?.status || 'Not reachable');
    console.log('Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Please check Railway dashboard:');
  console.log('1. Go to https://railway.app');
  console.log('2. Open your wisper-reseller-api project');
  console.log('3. Click on "Variables" tab');
  console.log('4. Verify these variables exist:');
  console.log('   - PAYMENTPOINT_BASE_URL');
  console.log('   - PAYMENTPOINT_API_KEY');
  console.log('   - PAYMENTPOINT_SECRET_KEY');
  console.log('='.repeat(80));
}

testEnvVars();
