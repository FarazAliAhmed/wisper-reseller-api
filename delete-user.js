#!/usr/bin/env node

/**
 * Delete User Script
 * Deletes a user and their associated data from the database
 */

require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

async function deleteUser(email) {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    // Define models
    const Account = mongoose.model("Account", new mongoose.Schema({}, { strict: false }), "accounts");
    const DataBalance = mongoose.model("DataBalance", new mongoose.Schema({}, { strict: false }), "databalances");
    const PaymentPointHistory = mongoose.model("PaymentPointHistory", new mongoose.Schema({}, { strict: false }), "paymentpointhistories");
    const MonnifyHistory = mongoose.model("MonnifyHistory", new mongoose.Schema({}, { strict: false }), "monnifyhistories");

    // Find the user
    const user = await Account.findOne({ email: email });

    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      await mongoose.connection.close();
      process.exit(1);
    }

    const userId = user._id.toString();
    const userName = user.name || user.username;

    console.log("=== USER TO BE DELETED ===");
    console.log(`Name: ${userName}`);
    console.log(`Email: ${user.email}`);
    console.log(`ID: ${userId}`);
    console.log(`Created: ${user.createdAt || 'N/A'}`);
    console.log("");

    // Check for associated data
    const balance = await DataBalance.findOne({ business: userId });
    const paymentPointTxns = await PaymentPointHistory.countDocuments({ business_id: userId });
    const monnifyTxns = await MonnifyHistory.countDocuments({ business_id: userId });

    console.log("=== ASSOCIATED DATA ===");
    console.log(`Balance Record: ${balance ? 'Yes' : 'No'}`);
    if (balance) {
      console.log(`  Wallet Balance: ₦${balance.wallet_balance || 0}`);
    }
    console.log(`PaymentPoint Transactions: ${paymentPointTxns}`);
    console.log(`Monnify Transactions: ${monnifyTxns}`);
    console.log("");

    // Confirm deletion
    console.log("⚠️  WARNING: This action cannot be undone!");
    console.log("Proceeding with deletion in 3 seconds...\n");
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete user and associated data
    console.log("🗑️  Deleting user and associated data...\n");

    // Delete balance record
    if (balance) {
      await DataBalance.deleteOne({ business: userId });
      console.log("✓ Deleted balance record");
    }

    // Delete PaymentPoint transaction history
    if (paymentPointTxns > 0) {
      const ppResult = await PaymentPointHistory.deleteMany({ business_id: userId });
      console.log(`✓ Deleted ${ppResult.deletedCount} PaymentPoint transaction(s)`);
    }

    // Delete Monnify transaction history
    if (monnifyTxns > 0) {
      const monnifyResult = await MonnifyHistory.deleteMany({ business_id: userId });
      console.log(`✓ Deleted ${monnifyResult.deletedCount} Monnify transaction(s)`);
    }

    // Delete user account
    await Account.deleteOne({ _id: userId });
    console.log("✓ Deleted user account");

    console.log("");
    console.log("=== DELETION COMPLETE ===");
    console.log(`✅ User "${userName}" (${email}) has been successfully deleted`);
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

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error("❌ Error: Email address required");
  console.log("Usage: node delete-user.js <email>");
  console.log("Example: node delete-user.js obohedward@gmail.com");
  process.exit(1);
}

deleteUser(email);
