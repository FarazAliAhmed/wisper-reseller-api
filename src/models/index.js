const mongoose = require("mongoose");
const config = require("../../config/default");
const { loadPlans } = require("../scripts/loader");

const nodeEnv = process.env.NODE_ENV;

console.log({ nodeEnv });
console.log("DB Config:", config.db ? "DB URL exists" : "DB URL is undefined/null");
console.log("First 20 chars of DB URL:", config.db ? config.db.substring(0, 20) : "N/A");

const dbSetUp = async () => {
  try {
    if (nodeEnv == "development") {
      await mongoose.connect(config.dbTest, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await loadPlans();
      console.log("plans loaded");
      console.log(`Connected to DB:: `, config.dbTest);
    } else {
      await mongoose.connect(config.db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await loadPlans();
      console.log("plans loaded");
      console.log(`Connected to DB`);
    }
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
};

module.exports = dbSetUp;
