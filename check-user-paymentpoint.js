#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { Account } = require('./src/models/account');

async function checkUserPaymentPoint() {
  try {
    const email = 'chisomalaoma@gmail.com';
    
    console.log('='.repeat(80));
    console.log(`Checking PaymentPoint Account for: ${email}`);
    console.log('='.repeat(80));

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB\n');

    // Find user
    const user = await Account.findOne({ email }).exec();

    if (!user) {
      console.log('❌ User not found!');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('User Details:');
    console.log('-'.repeat(80));
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Username: ${user.username}`);
    console.log(`Phone: ${user.mobile_number || user.phone || 'N/A'}`);
    console.log('');

    console.log('PaymentPoint Account Status:');
    console.log('-'.repeat(80));
    
    if (user.paymentpointAccountReference) {
      console.log(`✅ Account Reference: ${user.paymentpointAccountReference}`);
    } else {
      console.log('❌ No Account Reference');
    }

    if (user.paymentpointAccounts && user.paymentpointAccounts.length > 0) {
      console.log(`✅ PaymentPoint Accounts: ${user.paymentpointAccounts.length}`);
      console.log('');
      user.paymentpointAccounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.bankName}`);
        console.log(`   Account Number: ${account.accountNumber}`);
        console.log(`   Account Name: ${account.accountName}`);
        console.log('');
      });
    } else {
      console.log('❌ No PaymentPoint Accounts');
    }

    console.log('Monnify/Old Bank Accounts:');
    console.log('-'.repeat(80));
    if (user.bankAccounts && user.bankAccounts.length > 0) {
      console.log(`Found ${user.bankAccounts.length} old Monnify accounts (should be removed)`);
      user.bankAccounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.bankName}: ${account.accountNumber}`);
      });
    } else {
      console.log('✅ No old Monnify accounts (cleaned)');
    }

    console.log('\n' + '='.repeat(80));

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUserPaymentPoint();
