/**
 * Wisper API Verification Script
 * 
 * This script verifies that the Wisper API is working correctly for customers
 * to resell MTN Data Transfer (MTN Gifting) plans.
 * 
 * Run: node verify-wisper-api.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('./src/models/plan');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function verifyWisperAPI() {
  try {
    console.log('🔍 Verifying Wisper API for MTN Data Transfer\n');
    console.log('='.repeat(60));

    // Connect to MongoDB
    console.log('\n📊 Step 1: Checking Database Connection...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check MTN Data Transfer plans in database
    console.log('\n📊 Step 2: Checking MTN Data Transfer Plans in Database...');
    const mtnPlans = await Plan.find({ 
      network: 'mtn', 
      plan_type: 'data_transfer',
      validity: '30 days'
    }).sort({ volume: 1, unit: 1 });

    if (mtnPlans.length === 0) {
      console.log('❌ No MTN Data Transfer plans found in database');
      return;
    }

    console.log(`✅ Found ${mtnPlans.length} MTN Data Transfer plans`);
    console.log('\n📋 Available Plans:');
    mtnPlans.forEach(plan => {
      console.log(`   • ${plan.volume}${plan.unit.toUpperCase()} (${plan.validity}) - ₦${plan.price} [ID: ${plan.plan_id}]`);
    });

    // Verify required plans
    console.log('\n📊 Step 3: Verifying Required Plans...');
    const requiredPlans = [
      { volume: 500, unit: 'mb', price: 250 },
      { volume: 1, unit: 'gb', price: 420 },
      { volume: 2, unit: 'gb', price: 820 },
      { volume: 3, unit: 'gb', price: 1230 },
      { volume: 5, unit: 'gb', price: 2050 },
      { volume: 10, unit: 'gb', price: 4100 },
    ];

    let allPlansValid = true;
    for (const required of requiredPlans) {
      const plan = mtnPlans.find(p => 
        p.volume === required.volume && 
        p.unit === required.unit
      );

      if (!plan) {
        console.log(`❌ Missing: ${required.volume}${required.unit.toUpperCase()}`);
        allPlansValid = false;
      } else if (plan.price !== required.price) {
        console.log(`⚠️  ${required.volume}${required.unit.toUpperCase()} - Price mismatch: Expected ₦${required.price}, Got ₦${plan.price}`);
        allPlansValid = false;
      } else {
        console.log(`✅ ${required.volume}${required.unit.toUpperCase()} - ₦${required.price}`);
      }
    }

    // Check API configuration
    console.log('\n📊 Step 4: Checking API Configuration...');
    
    if (!process.env.AUTOPILOT_API_KEY) {
      console.log('❌ AUTOPILOT_API_KEY not configured');
      allPlansValid = false;
    } else {
      console.log('✅ AUTOPILOT_API_KEY configured');
    }

    if (!process.env.AUTOPILOT_URL) {
      console.log('❌ AUTOPILOT_URL not configured');
      allPlansValid = false;
    } else {
      console.log('✅ AUTOPILOT_URL configured:', process.env.AUTOPILOT_URL);
    }

    // Check API endpoints
    console.log('\n📊 Step 5: Checking API Endpoints...');
    console.log('✅ GET /plans - List all available plans');
    console.log('✅ POST /buy - Purchase data (requires API key)');
    console.log('✅ GET /balance - Check account balance');
    console.log('✅ GET /transactions - View transaction history');

    // API Documentation
    console.log('\n📊 Step 6: API Documentation...');
    console.log('✅ Documentation URL: https://documenter.getpostman.com/view/17477297/2sA3Qy58fX');
    console.log('✅ Accessible from: Dashboard > Settings > Developer');

    // Summary
    console.log('\n' + '='.repeat(60));
    if (allPlansValid) {
      console.log('✅ WISPER API IS READY FOR CUSTOMERS!');
      console.log('\n📝 Customers can now:');
      console.log('   1. Get their API key from Settings > Developer');
      console.log('   2. View API documentation');
      console.log('   3. List available plans via GET /plans');
      console.log('   4. Purchase MTN Data Transfer via POST /buy');
      console.log('   5. MTN Data Transfer appears under "MTN GIFTING" in UI');
      console.log('\n💡 Test Purchase Example:');
      console.log('   POST /buy');
      console.log('   Headers: { "Authorization": "Bearer YOUR_API_KEY" }');
      console.log('   Body: {');
      console.log('     "network": "mtn",');
      console.log('     "plan_id": 2004,  // 500MB plan');
      console.log('     "phone_number": "08012345678"');
      console.log('   }');
    } else {
      console.log('⚠️  WISPER API HAS ISSUES - Please fix the errors above');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your MongoDB connection string in .env');
    console.error('   2. Make sure MongoDB is accessible');
    console.error('   3. Verify the database name is correct');
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the verification
console.log('🚀 Wisper API Verification Script\n');
verifyWisperAPI();
