const mongoose = require("mongoose");
const config = require("config");

const dbSetUp = async () => {
  try {
    await mongoose.connect(config.get("db"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to database successfully...`);
  } catch (error) {
    console.error(error);
  }
};

module.exports = dbSetUp;
