console.log("Environment variables check:");
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "SET" : "NOT SET");
console.log("- DB_URL:", process.env.DB_URL ? "SET" : "NOT SET");
console.log("- NODE_ENV:", process.env.NODE_ENV);

module.exports = {
  db: process.env.MONGODB_URI || process.env.DB_URL,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT,
};
