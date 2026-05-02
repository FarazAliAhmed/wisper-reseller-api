#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { Account } = require('./src/models/account');

// The accounts we created earlier
const accountsToFix = [
  {
    email: 'chisomalaoma@gmail.com',
    customer_id: 'bd85f0e13554fe0f01f2f9dddf55d6e0f552661c', // From first test
    accounts: [
      {
        bankName: 'Palmpay',
        accountNumber: '6618607556',
        accountName: 'XTes-Chi(Paymentpoint)'
      }
    ]
  },
  {
    email: 'macalaoma12@gmail.com',
    customer_id: 'bd85f0e13554fe0f01f2f9dddf55d6e0f552661c', // Will be different
    accounts: [
      {
        bankName: 'Palmpay',
        accountNumber: '6662653413',
        accountName: 'XTes-Mic(Paymentpoint)'
      }
    ]
  },
  {
    email: 'rolo@gmail.com',
    customer_id: 'bd85f0e13554fe0f01f2f9dddf55d6e0f552661c', // Will be different
    accounts: [
      {
        bankName: 'Palmpay',
        accountNumber: '6690542823',
        accountName: 'XTes-Rol(Paymentpoint)'
      }
    ]
  }
];

async function fixPaymentPointAccounts() {
  try {
    console.log('='.repeat(80));
    console.log('Fix PaymentPoint Accounts in Database');
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

    for (const accountData of accountsToFix) {
      console.log(`Updating: ${accountData.email}`);
      
      const user = await Account.findOne({ email: accountData.email });
      
      if (!user) {
        console.log(`  ❌ User not found: ${accountData.email}\n`);
        continue;
      }

      const result = await Account.findOneAndUpdate(
        { email: accountData.email },
        {
          $set: {
            paymentpointAccounts: accountData.accounts,
            paymentpointAccountReference: user._id.toString()
          }
        },
        { new: true }
      );

      if (result) {
        console.log(`  ✅ Updated successfully`);
        console.log(`     Account: ${accountData.accounts[0].bankName} - ${accountData.accounts[0].accountNumber}`);
        console.log(`     Name: ${accountData.accounts[0].accountName}\n`);
      }
    }

    console.log('='.repeat(80));
    console.log('All accounts updated!');
    console.log('='.repeat(80));

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPaymentPointAccounts();
