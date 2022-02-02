const mongoose = require("mongoose");
const { LOCAL_DB_URL, DB_URL } = require("../config");

const dbSetUp = () => {
  module.exports = async () => {
    try {
      await mongoose.connect(LOCAL_DB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });
      mongoose.set("useFindAndModify", false);
      console.log(`Connected to database successfully...`);
    } catch (error) {
      console.error(error);
    }
  };
};

module.exports = dbSetUp;
