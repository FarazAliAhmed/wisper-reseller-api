require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");

async function updatePrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const Plan = mongoose.model("Plan", new mongoose.Schema({}, { strict: false }), "plans");

    // MTN Direct pricing structure
    const mtnPrices = {
      "500 mb": 500,
      "1 gb": 800,
      "2 gb": 1500,
      "3 gb": 2500,
      "5 gb": 3500,
      "10 gb": 4500,
      "15 gb": 8250,
      "20 gb": 11000,
      "40 gb": 22000,
      "75 gb": 41250,
      "100 gb": 55000,
    };

    console.log("=== Updating Airtel Plans ===\n");

    // Update Airtel plans
    for (const [size, price] of Object.entries(mtnPrices)) {
      const [volume, unit] = size.split(" ");
      
      const result = await Plan.updateMany(
        {
          network: "airtel",
          volume: parseFloat(volume),
          unit: unit,
        },
        {
          $set: { price: price }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✓ Updated Airtel ${size} to ₦${price} (${result.modifiedCount} plan(s))`);
      }
    }

    console.log("\n=== Updating 9mobile Plans ===\n");

    // Update 9mobile plans
    for (const [size, price] of Object.entries(mtnPrices)) {
      const [volume, unit] = size.split(" ");
      
      const result = await Plan.updateMany(
        {
          network: "9mobile",
          volume: parseFloat(volume),
          unit: unit,
        },
        {
          $set: { price: price }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✓ Updated 9mobile ${size} to ₦${price} (${result.modifiedCount} plan(s))`);
      }
    }

    console.log("\n=== Verification ===\n");

    // Verify Airtel plans
    const airtelPlans = await Plan.find({ network: "airtel" }).sort({ volume: 1, unit: 1 });
    console.log("Airtel Plans:");
    airtelPlans.forEach(plan => {
      console.log(`  ${plan.volume} ${plan.unit} - ₦${plan.price}`);
    });

    console.log("\n9mobile Plans:");
    const nineMobilePlans = await Plan.find({ network: "9mobile" }).sort({ volume: 1, unit: 1 });
    nineMobilePlans.forEach(plan => {
      console.log(`  ${plan.volume} ${plan.unit} - ₦${plan.price}`);
    });

    console.log("\n✅ Price update completed successfully!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updatePrices();
