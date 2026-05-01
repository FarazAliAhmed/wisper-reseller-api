#!/usr/bin/env node

/**
 * Check User-Specific Plans
 * Checks if users have custom pricing in the userplans collection
 */

require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

async function checkUserPlans() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    const Account = mongoose.model("Account", new mongoose.Schema({}, { strict: false }), "accounts");
    const UserPlan = mongoose.model("UserPlan", new mongoose.Schema({}, { strict: false }), "userplans");

    // Get all users
    const users = await Account.find({}).select('_id name username email');
    console.log(`Found ${users.length} users\n`);

    console.log("=== USER-SPECIFIC PLANS ===\n");

    for (const user of users) {
      const userPlans = await UserPlan.find({ business: user._id.toString() });
      
      console.log(`${user.name || user.username} (${user.email}):`);
      console.log(`  User ID: ${user._id}`);
      console.log(`  Custom Plans: ${userPlans.length}`);
      
      if (userPlans.length > 0) {
        console.log(`  Plans:`);
        userPlans.forEach(plan => {
          const size = plan.unit === 'gb' ? `${plan.volume}GB` : `${plan.volume}MB`;
          console.log(`    - ${plan.network.toUpperCase()} ${size} (${plan.plan_type}): ₦${plan.price}`);
        });
      }
      console.log('');
    }

    // Check total user plans
    const totalUserPlans = await UserPlan.countDocuments();
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total Users: ${users.length}`);
    console.log(`Total User-Specific Plans: ${totalUserPlans}`);

    if (totalUserPlans === 0) {
      console.log("\n✓ No user-specific plans found.");
      console.log("  Users will see the default plans from the main 'plans' collection.");
    } else {
      console.log("\n⚠️  User-specific plans exist!");
      console.log("  These override the default plans and need to be updated separately.");
    }

    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

checkUserPlans();
