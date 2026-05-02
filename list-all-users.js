#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { Account } = require('./src/models/account');

async function listAllUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB\n');

    // Fetch all users
    const users = await Account.find({})
      .select('_id name username email business_name mobile_number phone isAdmin confirmed createdAt')
      .sort({ createdAt: -1 })
      .exec();

    console.log(`Total Users: ${users.length}\n`);
    console.log('=' .repeat(100));

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User Details:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Business Name: ${user.business_name || 'N/A'}`);
      console.log(`   Phone: ${user.mobile_number || user.phone || 'N/A'}`);
      console.log(`   Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
      console.log(`   Confirmed: ${user.confirmed ? 'Yes' : 'No'}`);
      console.log(`   Created: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}`);
      console.log('-'.repeat(100));
    });

    console.log(`\n\nTotal Users: ${users.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listAllUsers();
