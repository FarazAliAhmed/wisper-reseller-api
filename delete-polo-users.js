#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { Account } = require('./src/models/account');

async function deletePoloUsers() {
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

    // Find all Polo polo users
    const poloUsers = await Account.find({
      email: {
        $in: [
          'popol@gmail.com',
          'pol@gmail.com',
          'polo@gmail.com',
          'polopolo@gmail.com'
        ]
      }
    }).exec();

    console.log(`Found ${poloUsers.length} Polo polo users to delete:\n`);
    
    poloUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Username: ${user.username}`);
    });

    console.log('\nDeleting users...');

    // Delete all Polo polo users
    const result = await Account.deleteMany({
      email: {
        $in: [
          'popol@gmail.com',
          'pol@gmail.com',
          'polo@gmail.com',
          'polopolo@gmail.com'
        ]
      }
    });

    console.log(`\n✅ Successfully deleted ${result.deletedCount} users`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deletePoloUsers();
