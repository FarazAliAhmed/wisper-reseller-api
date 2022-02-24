const config = require("config");

module.exports = {
  db: config.util.getEnv("DB_URL"),
  jwtSecret: config.util.getEnv("JWT_SECRET"),
  port: config.util.getEnv("PORT"),
};
