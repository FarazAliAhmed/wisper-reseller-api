#!/usr/bin/env node

require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

async function viewPlanStructure() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    const Plan = mongoose.model("Plan", new mongoose.Schema({}, { strict: false }), "plans");

    // Get a few sample plans from each network
    const networks = ['mtn', 'glo', 'airtel', '9mobile'];
    
    for (const network of networks) {
      console.log(`\n=== ${network.toUpperCase()} SAMPLE PLANS ===\n`);
      const plans = await Plan.find({ network: network }).limit(3);
      
      plans.forEach((plan, index) => {
        console.log(`Plan ${index + 1}:`);
        console.log(JSON.stringify(plan.toObject(), null, 2));
        console.log("\n" + "─".repeat(80) + "\n");
      });
    }

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error("Error:", error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

viewPlanStructure();
