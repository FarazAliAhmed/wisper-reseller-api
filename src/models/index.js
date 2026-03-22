const mongoose = require("mongoose");
const config = require("../../config/default");
const { loadPlans } = require("../scripts/loader");

const nodeEnv = process.env.NODE_ENV;

console.log({ nodeEnv });

const dbSetUp = async () => {
  try {
    // Use environment variable if available, otherwise fall back to config file
    const dbUri = process.env.MONGODB_URI || (nodeEnv === "development" ? config.dbTest : config.db);
    
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await loadPlans();
    console.log("plans loaded");
    console.log(`Connected to DB:: `, dbUri.replace(/\/\/[^:]+:[^@]+@/, '//*****:*****@')); // Hide credentials in logs
  } catch (error) {
    console.error(error);
  }
};

module.exports = dbSetUp;
