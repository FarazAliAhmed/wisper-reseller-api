#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { Account } = require('./src/models/account');

async function generateToken() {
  try {
    const email = 'chisomalaoma@gmail.com';
    
    console.log('='.repeat(80));
    console.log(`Generating JWT Token for: ${email}`);
    console.log('='.repeat(80));

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('\n✓ Connected to MongoDB\n');

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
    console.log(`ID: ${user._id}`);
    console.log('');

    // Generate new token
    const token = user.generateAuthToken();

    console.log('JWT Token Generated:');
    console.log('-'.repeat(80));
    console.log(token);
    console.log('');
    console.log('='.repeat(80));
    console.log('Copy the token above and use it for API requests');
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

generateToken();
