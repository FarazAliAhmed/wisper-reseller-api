const mongoose = require("mongoose");
const config = require("./config/default");

async function fixIndex() {
  try {
    await mongoose.connect(config.dbTest, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("Connected to database");
    
    const db = mongoose.connection.db;
    const collection = db.collection("accounts");
    
    // Drop the problematic index
    try {
      await collection.dropIndex("plans.plan_id_1");
      console.log("Successfully dropped plans.plan_id_1 index");
    } catch (err) {
      console.log("Index might not exist:", err.message);
    }
    
    console.log("Done! You can now restart the server.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixIndex();
