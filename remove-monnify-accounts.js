#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { Account } = require('./src/models/account');

async function removeMonnifyAccounts() {
  try {
    console.log('='.repeat(80));
    console.log('Remove Monnify Bank Accounts from All Users');
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

    // Find all users with bankAccounts (Monnify accounts)
    const usersWithMonnify = await Account.find({
      bankAccounts: { $exists: true, $ne: [] }
    }).select('_id name email bankAccounts').exec();

    console.log(`Found ${usersWithMonnify.length} users with Monnify bank accounts\n`);

    if (usersWithMonnify.length === 0) {
      console.log('No Monnify accounts to remove.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Display users
    console.log('Users with Monnify accounts:\n');
    usersWithMonnify.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Monnify Accounts: ${user.bankAccounts.length}`);
      user.bankAccounts.forEach(account => {
        console.log(`      - ${account.bankName}: ${account.accountNumber} (${account.accountName})`);
      });
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\nRemoving all Monnify bank accounts...\n');

    // Remove bankAccounts from all users
    const result = await Account.updateMany(
      {},
      { 
        $set: { bankAccounts: [] }
      }
    );

    console.log('✅ SUCCESS!');
    console.log(`Updated ${result.modifiedCount} users`);
    console.log('All Monnify bank accounts have been removed.');
    console.log('Only PaymentPoint accounts will now be visible.\n');

    console.log('='.repeat(80));

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

removeMonnifyAccounts();
