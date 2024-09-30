const mongoose = require("mongoose");
const config = require("../../config/default");
const { loadPlans } = require("../scripts/loader");

const nodeEnv = process.env.NODE_ENV;

console.log({ nodeEnv });

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
      console.log(`Connected to DB:: `, config.db);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = dbSetUp;
