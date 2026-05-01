require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

async function checkMTNPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const Plan = mongoose.model("Plan", new mongoose.Schema({}, { strict: false }), "plans");

    // Get MTN Direct plans
    const mtnPlans = await Plan.find({ 
      network: "mtn",
      plan_type: "direct"
    }).sort({ size: 1 });

    console.log("=== Current MTN Direct Prices ===\n");
    
    if (mtnPlans.length === 0) {
      console.log("No MTN Direct plans found!");
    } else {
      mtnPlans.forEach(plan => {
        console.log(`${plan.size} - ₦${plan.price} (${plan.duration || 'monthly'})`);
      });
    }

    console.log("\n=== MTN Plans Details ===\n");
    console.log(JSON.stringify(mtnPlans, null, 2));

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkMTNPrices();
