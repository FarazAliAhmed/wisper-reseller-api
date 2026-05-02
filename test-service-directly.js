#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const paymentPointService = require('./src/services/paymentpoint.service');

async function testServiceDirectly() {
  try {
    console.log('Testing PaymentPoint Service Directly...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB\n');

    // Test getAccountDetails for Chisom
    const chisomUserId = '69c00a54caece05fc8696e5b';
    
    console.log(`Testing getAccountDetails for user ID: ${chisomUserId}`);
    const accountDetails = await paymentPointService.getAccountDetails(chisomUserId);

    if (accountDetails) {
      console.log('\n✅ Account details found!');
      console.log(JSON.stringify(accountDetails, null, 2));
    } else {
      console.log('\n❌ No account details found');
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testServiceDirectly();
