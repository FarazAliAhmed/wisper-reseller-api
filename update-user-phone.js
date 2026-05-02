require('dotenv').config();
const mongoose = require('mongoose');
const { Account } = require('./src/models/account');

const dbUrl = process.env.MONGODB_URI;

async function updateUserPhone() {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to database');

    const user = await Account.findOneAndUpdate(
      { username: 'farar0' },
      { mobile_number: '03044383409' },
      { new: true }
    );

    if (!user) {
      console.log('User farar0 not found');
    } else {
      console.log(`✓ Updated phone for ${user.name} (${user.email})`);
      console.log(`  Phone: ${user.mobile_number}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateUserPhone();
