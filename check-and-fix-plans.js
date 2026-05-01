#!/usr/bin/env node

/**
 * Check and Fix Data Plans Pricing
 * Verifies and updates all network plans with correct pricing
 */

require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

// Correct pricing structure based on requirements
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

async function checkAndFixPlans() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    const Plan = mongoose.model("Plan", new mongoose.Schema({}, { strict: false }), "plans");

    // Fetch all plans
    const allPlans = await Plan.find({}).sort({ network: 1, size: 1 });

    console.log("=== CURRENT PLANS IN DATABASE ===\n");
    console.log(`Total Plans: ${allPlans.length}\n`);

    // Group by network
    const plansByNetwork = {};
    allPlans.forEach(plan => {
      const network = plan.network.toUpperCase();
      if (!plansByNetwork[network]) {
        plansByNetwork[network] = [];
      }
      plansByNetwork[network].push(plan);
    });

    // Display current plans
    Object.keys(plansByNetwork).sort().forEach(network => {
      console.log(`\n${network}:`);
      console.log("─".repeat(60));
      plansByNetwork[network].forEach(plan => {
        const size = plan.size || plan.data_size || 'N/A';
        const price = plan.price || plan.amount || 'N/A';
        const validity = plan.validity || '30 days';
        const planType = plan.plan_type || plan.planType || 'N/A';
        console.log(`  ${size.padEnd(10)} - ₦${String(price).padEnd(8)} (${validity}, ${planType})`);
      });
    });

    console.log("\n\n=== CHECKING FOR PRICING ISSUES ===\n");

    let issuesFound = 0;
    const updates = [];

    // Check MTN Direct plans
    const mtnPlans = allPlans.filter(p => 
      p.network.toLowerCase() === 'mtn' && 
      (p.plan_type === 'direct' || p.planType === 'direct')
    );

    console.log("Checking MTN Direct plans...");
    for (const plan of mtnPlans) {
      const size = (plan.size || plan.data_size || '').toUpperCase();
      const currentPrice = Number(plan.price || plan.amount || 0);
      const correctPrice = CORRECT_PRICING.MTN_DIRECT[size];

      if (correctPrice && currentPrice !== correctPrice) {
        console.log(`  ❌ ${size}: Current ₦${currentPrice} → Should be ₦${correctPrice}`);
        issuesFound++;
        updates.push({
          filter: { _id: plan._id },
          update: { $set: { price: correctPrice, amount: correctPrice } }
        });
      } else if (correctPrice) {
        console.log(`  ✓ ${size}: ₦${currentPrice} (correct)`);
      }
    }

    // Check GLO plans
    const gloPlans = allPlans.filter(p => p.network.toLowerCase() === 'glo');
    console.log("\nChecking GLO plans...");
    for (const plan of gloPlans) {
      const size = (plan.size || plan.data_size || '').toUpperCase();
      const currentPrice = Number(plan.price || plan.amount || 0);
      const correctPrice = CORRECT_PRICING.GLO[size];

      if (correctPrice && currentPrice !== correctPrice) {
        console.log(`  ❌ ${size}: Current ₦${currentPrice} → Should be ₦${correctPrice}`);
        issuesFound++;
        updates.push({
          filter: { _id: plan._id },
          update: { $set: { price: correctPrice, amount: correctPrice } }
        });
      } else if (correctPrice) {
        console.log(`  ✓ ${size}: ₦${currentPrice} (correct)`);
      }
    }

    // Check AIRTEL plans
    const airtelPlans = allPlans.filter(p => p.network.toLowerCase() === 'airtel');
    console.log("\nChecking AIRTEL plans...");
    for (const plan of airtelPlans) {
      const size = (plan.size || plan.data_size || '').toUpperCase();
      const currentPrice = Number(plan.price || plan.amount || 0);
      const correctPrice = CORRECT_PRICING.AIRTEL[size];

      if (correctPrice && currentPrice !== correctPrice) {
        console.log(`  ❌ ${size}: Current ₦${currentPrice} → Should be ₦${correctPrice}`);
        issuesFound++;
        updates.push({
          filter: { _id: plan._id },
          update: { $set: { price: correctPrice, amount: correctPrice } }
        });
      } else if (correctPrice) {
        console.log(`  ✓ ${size}: ₦${currentPrice} (correct)`);
      }
    }

    // Check 9MOBILE plans
    const nineMobilePlans = allPlans.filter(p => p.network.toLowerCase() === '9mobile');
    console.log("\nChecking 9MOBILE plans...");
    for (const plan of nineMobilePlans) {
      const size = (plan.size || plan.data_size || '').toUpperCase();
      const currentPrice = Number(plan.price || plan.amount || 0);
      const correctPrice = CORRECT_PRICING["9MOBILE"][size];

      if (correctPrice && currentPrice !== correctPrice) {
        console.log(`  ❌ ${size}: Current ₦${currentPrice} → Should be ₦${correctPrice}`);
        issuesFound++;
        updates.push({
          filter: { _id: plan._id },
          update: { $set: { price: correctPrice, amount: correctPrice } }
        });
      } else if (correctPrice) {
        console.log(`  ✓ ${size}: ₦${currentPrice} (correct)`);
      }
    }

    console.log("\n\n=== SUMMARY ===\n");
    console.log(`Total Plans: ${allPlans.length}`);
    console.log(`Issues Found: ${issuesFound}`);
    console.log(`Updates Needed: ${updates.length}`);

    if (updates.length > 0) {
      console.log("\n⚠️  Would you like to apply these fixes? (Running in 3 seconds...)\n");
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log("Applying updates...\n");
      for (const update of updates) {
        await Plan.updateOne(update.filter, update.update);
      }
      console.log(`✅ Successfully updated ${updates.length} plan(s)\n`);
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

checkAndFixPlans();
