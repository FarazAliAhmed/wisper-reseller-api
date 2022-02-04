const config = require("config");

export default {
  db: config.util.getEnv("DB_URL"),
  jwtSecret: config.util.getEnv("JWT_SECRET"),
  port: config.util.getEnv("PORT"),
};
