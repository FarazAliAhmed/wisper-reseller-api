require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

async function addMTN7GBPlan() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const Plan = mongoose.model("Plan", new mongoose.Schema({}, { strict: false }), "plans");

    // Check if 7GB plan already exists
    const existingPlan = await Plan.findOne({
      network: "mtn",
      plan_type: "direct",
      volume: 7,
      unit: "gb"
    });

    if (existingPlan) {
      console.log("7GB plan already exists. Updating price...");
      existingPlan.price = 3500;
      await existingPlan.save();
      console.log("✓ Updated existing 7GB plan to ₦3,500");
    } else {
      // Find the highest plan_id to generate a new one
      const highestPlan = await Plan.findOne().sort({ plan_id: -1 });
      const newPlanId = (highestPlan?.plan_id || 0) + 1;

      // Create new 7GB plan
      const newPlan = new Plan({
        plan_id: newPlanId,
        network: "mtn",
        plan_type: "direct",
        price: 3500,
        volume: 7,
        unit: "gb",
        validity: "monthly"
      });

      await newPlan.save();
      console.log(`✓ Created new MTN Direct 7GB plan (ID: ${newPlanId}) for ₦3,500`);
    }

    // Verify all MTN Direct plans
    console.log("\n=== All MTN Direct Plans ===\n");
    const allMTNPlans = await Plan.find({
      network: "mtn",
      plan_type: "direct"
    }).sort({ volume: 1 });

    allMTNPlans.forEach(plan => {
      console.log(`${plan.volume} ${plan.unit} - ₦${plan.price} (Plan ID: ${plan.plan_id})`);
    });

    console.log("\n✅ MTN 7GB plan added successfully!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

addMTN7GBPlan();
