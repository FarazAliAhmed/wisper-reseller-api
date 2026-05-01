#!/usr/bin/env node

/**
 * Add Phone Numbers to User Accounts
 * Updates specific users with their phone numbers
 */

require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

const PHONE_UPDATES = [
  {
    email: "chisomalaoma@gmail.com",
    phone: "09057790907"
  },
  {
    email: "macalaoma12@gmail.com",
    phone: "08131635113"
  }
];

async function addPhoneNumbers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    const Account = mongoose.model("Account", new mongoose.Schema({}, { strict: false }), "accounts");

    console.log("=== ADDING PHONE NUMBERS ===\n");

    for (const update of PHONE_UPDATES) {
      const user = await Account.findOne({ email: update.email });

      if (!user) {
        console.log(`❌ User not found: ${update.email}`);
        continue;
      }

      console.log(`Updating ${user.name || user.username} (${update.email})`);
      console.log(`  Current phone: ${user.phone || user.phoneNumber || 'NOT SET'}`);
      console.log(`  New phone: ${update.phone}`);

      await Account.updateOne(
        { email: update.email },
        { 
          $set: { 
            phone: update.phone,
            phoneNumber: update.phone 
          } 
        }
      );

      console.log(`  ✓ Phone number updated\n`);
    }

    console.log("=== VERIFICATION ===\n");

    // Verify all users
    const allUsers = await Account.find({}).select('_id name username email phone phoneNumber');
    
    allUsers.forEach(user => {
      const phone = user.phone || user.phoneNumber || 'NOT SET';
      const status = phone !== 'NOT SET' ? '✓' : '✗';
      console.log(`${status} ${user.name || user.username} (${user.email}): ${phone}`);
    });

    console.log("\n=== SUMMARY ===\n");
    const usersWithPhone = allUsers.filter(u => u.phone || u.phoneNumber);
    const usersWithoutPhone = allUsers.filter(u => !u.phone && !u.phoneNumber);
    
    console.log(`Users WITH phone: ${usersWithPhone.length}`);
    console.log(`Users WITHOUT phone: ${usersWithoutPhone.length}`);

    await mongoose.connection.close();
    console.log("\n✅ Phone numbers added successfully!");
    console.log("Database connection closed");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

addPhoneNumbers();
