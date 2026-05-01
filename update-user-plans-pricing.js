#!/usr/bin/env node

/**
 * Update User-Specific Plans Pricing
 * Updates all user plans to match the new pricing structure
 */

require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

// Correct pricing structure
const CORRECT_PRICING = {
  MTN_DIRECT: {
    "500MB": 500,
    "1GB": 800,
    "2GB": 1500,
    "3GB": 2500,
    "5GB": 3500,
    "7GB": 3500,
    "10GB": 4500,
    "15GB": 8250,
    "20GB": 11000,
    "40GB": 22000,
    "75GB": 41250,
    "100GB": 55000,
  },
  GLO: {
    "1GB": 400,
    "2GB": 800,
    "3GB": 1200,
    "5GB": 2000,
    "10GB": 4000,
  },
  AIRTEL: {
    "1GB": 400,
    "2GB": 800,
    "3GB": 1200,
    "5GB": 2000,
    "10GB": 4000,
  },
  "9MOBILE": {
    "1GB": 400,
    "2GB": 800,
    "3GB": 1200,
    "5GB": 2000,
    "10GB": 4000,
  },
};

function formatSize(volume, unit) {
  if (unit === 'gb') {
    return `${volume}GB`;
  } else if (unit === 'mb') {
    if (volume >= 1000) {
      return `${volume / 1000}GB`;
    }
    return `${volume}MB`;
  }
  return `${volume}${unit}`;
}

function getCorrectPrice(network, planType, volume, unit) {
  const size = formatSize(volume, unit);
  
  if (network === 'mtn' && planType === 'direct') {
    return CORRECT_PRICING.MTN_DIRECT[size.toUpperCase()];
  } else if (network === 'glo') {
    return CORRECT_PRICING.GLO[size.toUpperCase()];
  } else if (network === 'airtel') {
    return CORRECT_PRICING.AIRTEL[size.toUpperCase()];
  } else if (network === '9mobile') {
    return CORRECT_PRICING["9MOBILE"][size.toUpperCase()];
  }
  
  return null;
}

async function updateUserPlansPricing() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    const Account = mongoose.model("Account", new mongoose.Schema({}, { strict: false }), "accounts");
    const UserPlan = mongoose.model("UserPlan", new mongoose.Schema({}, { strict: false }), "userplans");

    // Get all users
    const users = await Account.find({}).select('_id name username email');
    console.log(`Found ${users.length} users\n`);

    console.log("=== CHECKING USER PLANS FOR UPDATES ===\n");

    let totalUpdates = 0;
    const updates = [];

    for (const user of users) {
      const userPlans = await UserPlan.find({ business: user._id.toString() });
      
      if (userPlans.length === 0) {
        console.log(`${user.name || user.username}: No custom plans`);
        continue;
      }

      console.log(`\n${user.name || user.username} (${user.email}):`);
      console.log(`  Total Plans: ${userPlans.length}`);
      
      let userUpdates = 0;
      
      for (const plan of userPlans) {
        const network = plan.network.toLowerCase();
        const planType = plan.plan_type || 'gifting';
        const volume = plan.volume;
        const unit = plan.unit;
        const currentPrice = plan.price;
        const size = formatSize(volume, unit);
        
        const correctPrice = getCorrectPrice(network, planType, volume, unit);
        
        if (correctPrice && currentPrice !== correctPrice) {
          userUpdates++;
          totalUpdates++;
          updates.push({
            filter: { _id: plan._id },
            update: { $set: { price: correctPrice } },
            info: {
              user: user.name || user.username,
              network: network.toUpperCase(),
              size,
              currentPrice,
              correctPrice,
              planType
            }
          });
        }
      }
      
      if (userUpdates > 0) {
        console.log(`  ⚠️  ${userUpdates} plans need updating`);
      } else {
        console.log(`  ✓ All plans have correct pricing`);
      }
    }

    console.log("\n\n=== SUMMARY ===\n");
    console.log(`Total Users: ${users.length}`);
    console.log(`Plans Needing Update: ${totalUpdates}`);

    if (totalUpdates > 0) {
      console.log("\n=== SAMPLE UPDATES (First 20) ===\n");
      updates.slice(0, 20).forEach((update, index) => {
        const info = update.info;
        console.log(`${index + 1}. ${info.user} - ${info.network} ${info.size}: ₦${info.currentPrice} → ₦${info.correctPrice}`);
      });

      if (updates.length > 20) {
        console.log(`\n... and ${updates.length - 20} more updates`);
      }

      console.log("\n⚠️  Applying updates in 3 seconds...\n");
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log("Updating user plans...\n");
      let successCount = 0;
      
      for (const update of updates) {
        try {
          await UserPlan.updateOne(update.filter, update.update);
          successCount++;
        } catch (error) {
          console.log(`✗ Failed to update plan: ${error.message}`);
        }
      }
      
      console.log(`\n✅ Successfully updated ${successCount}/${totalUpdates} user plan(s)\n`);
    } else {
      console.log("\n✅ All user plans have correct pricing!\n");
    }

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

updateUserPlansPricing();
