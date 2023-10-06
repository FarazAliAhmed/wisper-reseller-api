const mongoose = require("mongoose");
const config = require("config");
const { loadPlans } = require("../scripts/loader");

const dbSetUp = async () => {
  try {
    await mongoose.connect(config.get("db"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // await loadPlans();
    console.log(`Connected to DB:: `, config.get("db"));
  } catch (error) {
    console.error(error);
  }
};

module.exports = dbSetUp;
