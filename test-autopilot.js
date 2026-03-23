/**
 * MTN Data Transfer Integration Test Script
 * 
 * This script tests the Autopilot API integration directly
 * Run: node test-autopilot.js
 */

require('dotenv').config();
const axios = require('axios');

const AUTOPILOT_API_KEY = process.env.AUTOPILOT_API_KEY;
const AUTOPILOT_URL = process.env.AUTOPILOT_URL;

console.log('🔍 Testing MTN Data Transfer Integration...\n');

// Test 1: Check Environment Variables
console.log('📋 Test 1: Checking Environment Variables');
console.log('----------------------------------------');
if (!AUTOPILOT_API_KEY) {
  console.log('❌ AUTOPILOT_API_KEY is missing in .env file');
  process.exit(1);
} else {
  console.log('✅ AUTOPILOT_API_KEY found:', AUTOPILOT_API_KEY.substring(0, 20) + '...');
}

if (!AUTOPILOT_URL) {
  console.log('❌ AUTOPILOT_URL is missing in .env file');
  process.exit(1);
} else {
  console.log('✅ AUTOPILOT_URL found:', AUTOPILOT_URL);
}
console.log('\n');

// Test 2: Check API Connection
async function testAPIConnection() {
  console.log('📋 Test 2: Testing API Connection');
  console.log('----------------------------------------');
  
  try {
    const response = await axios.post(
      `${AUTOPILOT_URL}/v1/load/networks`,
      { networks: "all" },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${AUTOPILOT_API_KEY}`
        }
      }
    );

    if (response.data.status && response.data.code === 200) {
      console.log('✅ API Connection Successful');
      console.log('📊 Available Networks:', response.data.data.product.map(n => n.network).join(', '));
      return true;
    } else {
      console.log('❌ API Connection Failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ API Connection Error:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Check MTN Data Types
async function testMTNDataTypes() {
  console.log('\n📋 Test 3: Checking MTN Data Types');
  console.log('----------------------------------------');
  
  try {
    const response = await axios.post(
      `${AUTOPILOT_URL}/v1/load/data-types`,
      { networkId: "1" },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${AUTOPILOT_API_KEY}`
        }
      }
    );

    if (response.data.status && response.data.code === 200) {
      console.log('✅ MTN Data Types Retrieved Successfully');
      console.log('📊 Available Data Types:');
      response.data.data.product.forEach(type => {
        console.log(`   - ${type.name}`);
      });
      
      const hasDataTransfer = response.data.data.product.some(
        type => type.name === 'DATA TRANSFER'
      );
      
      if (hasDataTransfer) {
        console.log('✅ DATA TRANSFER is available!');
        return true;
      } else {
        console.log('⚠️  DATA TRANSFER not found in available types');
        return false;
      }
    } else {
      console.log('❌ Failed to retrieve data types:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Check MTN Data Transfer Plans
async function testMTNDataTransferPlans() {
  console.log('\n📋 Test 4: Checking MTN Data Transfer Plans');
  console.log('----------------------------------------');
  
  try {
    const response = await axios.post(
      `${AUTOPILOT_URL}/v1/load/data`,
      { 
        networkId: "1",
        dataType: "DATA TRANSFER"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${AUTOPILOT_API_KEY}`
        }
      }
    );

    if (response.data.status && response.data.code === 200) {
      console.log('✅ MTN Data Transfer Plans Retrieved Successfully');
      console.log('📊 Available Plans:');
      response.data.data.product.forEach(plan => {
        console.log(`   - ${plan.planName} (${plan.planId}) - ₦${plan.ourPrice}`);
      });
      return true;
    } else {
      console.log('❌ Failed to retrieve plans:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

// Test 5: Check Wallet Balance
async function testWalletBalance() {
  console.log('\n📋 Test 5: Checking Wallet Balance');
  console.log('----------------------------------------');
  console.log('⚠️  Note: This requires your Autopilot email address');
  console.log('⏭️  Skipping wallet balance check (optional test)');
  console.log('   You can check your balance in Autopilot dashboard');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting MTN Data Transfer Integration Tests\n');
  console.log('================================================\n');
  
  const test2 = await testAPIConnection();
  if (!test2) {
    console.log('\n❌ API Connection failed. Please check your API key and try again.');
    process.exit(1);
  }
  
  const test3 = await testMTNDataTypes();
  if (!test3) {
    console.log('\n⚠️  DATA TRANSFER type not available. Contact Autopilot support.');
  }
  
  const test4 = await testMTNDataTransferPlans();
  
  await testWalletBalance();
  
  console.log('\n================================================');
  console.log('🎉 All Tests Completed!\n');
  
  if (test2 && test3 && test4) {
    console.log('✅ MTN Data Transfer Integration is READY!');
    console.log('✅ You can now make data purchases through your API');
    console.log('\n📝 Next Steps:');
    console.log('   1. Test with a real MTN number (small amount first)');
    console.log('   2. Check transaction in Autopilot dashboard');
    console.log('   3. Verify recipient receives the data');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }
  
  console.log('\n');
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});
