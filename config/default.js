require("dotenv").config({ path: __dirname + "/../.env" });

module.exports = {
  db: process.env.MONGODB_URI,
  dbTest: process.env.MONGODB_URI_TEST,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || "5000",
};
