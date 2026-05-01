#!/usr/bin/env node

/**
 * Change User Password Script
 */

require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function changePassword(email, newPassword) {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    const Account = mongoose.model("Account", new mongoose.Schema({}, { strict: false }), "accounts");

    // Find the user
    const user = await Account.findOne({ email: email });

    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log("=== USER FOUND ===");
    console.log(`Name: ${user.name || user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`ID: ${user._id}`);
    console.log("");

    // Hash the new password
    console.log("Hashing new password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    console.log("Updating password in database...");
    await Account.updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );

    console.log("");
    console.log("✅ PASSWORD CHANGED SUCCESSFULLY!");
    console.log("");
    console.log("=== NEW LOGIN CREDENTIALS ===");
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
    console.log("");

    await mongoose.connection.close();
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

// Change password for farar0@gmail.com
changePassword("farar0@gmail.com", "ssapmms51");
