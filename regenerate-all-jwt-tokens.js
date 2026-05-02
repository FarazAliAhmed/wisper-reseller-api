require('dotenv').config();
const mongoose = require('mongoose');
const config = require('config');
const { Account } = require('./src/models/account');

// Get MongoDB URI from environment or config
const dbUrl = process.env.MONGODB_URI || config.get('db');

async function regenerateAllTokens() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(dbUrl);
    console.log('Connected to database successfully!\n');

    // Get all users
    const users = await Account.find({});
    console.log(`Found ${users.length} users in database\n`);

    if (users.length === 0) {
      console.log('No users found to update.');
      await mongoose.connection.close();
      return;
    }

    console.log('Regenerating JWT tokens for all users...\n');
    
    const results = [];
    
    for (const user of users) {
      try {
        // Generate new JWT token using the correct JWT_SECRET
        const newToken = user.generateAuthToken();
        
        results.push({
          email: user.email,
          name: user.name,
          username: user.username,
          token: newToken,
          isAdmin: user.isAdmin,
          type: user.type
        });
        
        console.log(`✓ Generated token for: ${user.email} (${user.name})`);
      } catch (error) {
        console.error(`✗ Error generating token for ${user.email}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('TOKEN REGENERATION COMPLETE');
    console.log('='.repeat(80) + '\n');

    console.log('NEW JWT TOKENS FOR ALL USERS:\n');
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name} (${result.email})`);
      console.log(`   Username: ${result.username}`);
      console.log(`   Type: ${result.type}${result.isAdmin ? ' (Admin)' : ''}`);
      console.log(`   Token: ${result.token}`);
      console.log('');
    });

    console.log('\n' + '='.repeat(80));
    console.log('INSTRUCTIONS FOR USERS:');
    console.log('='.repeat(80));
    console.log('1. Clear browser localStorage and sessionStorage');
    console.log('2. Login again with your credentials');
    console.log('3. Your new token will be automatically generated and stored');
    console.log('\nOR manually update localStorage with the token above:');
    console.log('localStorage.setItem("token", "YOUR_NEW_TOKEN_HERE");');
    console.log('='.repeat(80) + '\n');

    await mongoose.connection.close();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

regenerateAllTokens();
