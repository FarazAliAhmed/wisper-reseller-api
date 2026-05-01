#!/usr/bin/env node

/**
 * Fix All Plans Pricing
 * Updates all network plans with correct pricing based on volume
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

async function fixAllPlansPricing() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    const Plan = mongoose.model("Plan", new mongoose.Schema({}, { strict: false }), "plans");

    // Fetch all plans
    const allPlans = await Plan.find({}).sort({ network: 1, volume: 1 });

    console.log("=== CHECKING ALL PLANS ===\n");
    console.log(`Total Plans: ${allPlans.length}\n`);

    const updates = [];
    const plansByNetwork = {
      'mtn': [],
      'glo': [],
      'airtel': [],
      '9mobile': []
    };

    // Analyze all plans
    allPlans.forEach(plan => {
      const network = plan.network.toLowerCase();
      const planType = plan.plan_type || 'gifting';
      const volume = plan.volume;
      const unit = plan.unit;
      const currentPrice = plan.price;
      const size = formatSize(volume, unit);
      
      const correctPrice = getCorrectPrice(network, planType, volume, unit);
      
      const planInfo = {
        id: plan._id,
        plan_id: plan.plan_id,
        size,
        currentPrice,
        correctPrice,
        needsUpdate: correctPrice && currentPrice !== correctPrice,
        planType
      };
      
      if (plansByNetwork[network]) {
        plansByNetwork[network].push(planInfo);
      }
      
      if (planInfo.needsUpdate) {
        updates.push({
          filter: { _id: plan._id },
          update: { $set: { price: correctPrice } },
          info: planInfo
        });
      }
    });

    // Display plans by network
    Object.keys(plansByNetwork).forEach(network => {
      const plans = plansByNetwork[network];
      if (plans.length === 0) return;
      
      console.log(`\n${network.toUpperCase()}:`);
      console.log("─".repeat(70));
      
      plans.forEach(plan => {
        const status = plan.needsUpdate ? '❌' : '✓';
        const priceInfo = plan.needsUpdate 
          ? `₦${plan.currentPrice} → ₦${plan.correctPrice}`
          : `₦${plan.currentPrice}`;
        
        console.log(`  ${status} ${plan.size.padEnd(8)} ${priceInfo.padEnd(20)} (${plan.planType})`);
      });
    });

    console.log("\n\n=== SUMMARY ===\n");
    console.log(`Total Plans: ${allPlans.length}`);
    console.log(`Plans Needing Update: ${updates.length}`);

    if (updates.length > 0) {
      console.log("\n=== PLANS TO UPDATE ===\n");
      updates.forEach((update, index) => {
        const info = update.info;
        console.log(`${index + 1}. ${info.size} (${info.planType}): ₦${info.currentPrice} → ₦${info.correctPrice}`);
      });

      console.log("\n⚠️  Applying updates in 3 seconds...\n");
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log("Updating plans...\n");
      let successCount = 0;
      
      for (const update of updates) {
        try {
          await Plan.updateOne(update.filter, update.update);
          successCount++;
          console.log(`✓ Updated ${update.info.size} to ₦${update.info.correctPrice}`);
        } catch (error) {
          console.log(`✗ Failed to update ${update.info.size}: ${error.message}`);
        }
      }
      
      console.log(`\n✅ Successfully updated ${successCount}/${updates.length} plan(s)\n`);
    } else {
      console.log("\n✅ All plans have correct pricing!\n");
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

fixAllPlansPricing();
