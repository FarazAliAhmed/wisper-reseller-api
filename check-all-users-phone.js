#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { Account } = require('./src/models/account');

async function checkAllUsersPhone() {
  try {
    console.log('='.repeat(80));
    console.log('Checking All Users Phone Numbers');
    console.log('='.repeat(80));

    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = await Account.find({})
      .select('_id name email mobile_number phone paymentpointAccounts')
      .exec();

    console.log(`\nTotal Users: ${users.length}\n`);

    users.forEach((user, index) => {
      const phone = user.mobile_number || user.phone;
      const hasPaymentPoint = user.paymentpointAccounts && user.paymentpointAccounts.length > 0;
      
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Phone: ${phone || '❌ NO PHONE'}`);
      console.log(`   PaymentPoint: ${hasPaymentPoint ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAllUsersPhone();
