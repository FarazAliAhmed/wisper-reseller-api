require('dotenv').config();
const mongoose = require('mongoose');
const monnifyService = require('./src/services/monnify.service');
const { Account } = require('./src/models/account');

const MONGODB_URI = process.env.MONGODB_URI;

async function createMonnifyForUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    // Find the user
    const user = await Account.findOne({ email: "macalaoma12@gmail.com" });
    
    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("User found:");
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Business: ${user.business_name}`);
    console.log(`- ID: ${user._id}`);
    console.log(`- Current Bank Accounts: ${user.bankAccounts?.length || 0}\n`);

    // Create Monnify account
    console.log("Creating Monnify account...\n");
    
    const result = await monnifyService.createAccount(
      user._id.toString(),
      user.business_name || user.name,
      user.email,
      user.name,
      user.bvn || null,
      user.nin || null
    );

    console.log("✓ Monnify account created successfully!\n");
    console.log("Response:", JSON.stringify(result, null, 2));

    // Fetch updated user to see bank accounts
    const updatedUser = await Account.findOne({ email: "macalaoma12@gmail.com" });
    console.log("\n=== Bank Accounts Created ===");
    updatedUser.bankAccounts.forEach((account, index) => {
      console.log(`\n${index + 1}. ${account.bankName}`);
      console.log(`   Account Number: ${account.accountNumber}`);
      console.log(`   Account Name: ${account.accountName}`);
    });

  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

createMonnifyForUser();
