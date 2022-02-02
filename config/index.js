if (process.env.NODE_ENV !== "production") require("dotenv").config();

module.exports = {
  DB_URL: process.env.DB_URL,
  LOCAL_DB_URL: process.env.LOCAL_DB_URL,
  PORT: process.env.PORT,
};
