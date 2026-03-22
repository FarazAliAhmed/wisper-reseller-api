module.exports = {
  db: process.env.MONGODB_URI || process.env.DB_URL,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT,
};
