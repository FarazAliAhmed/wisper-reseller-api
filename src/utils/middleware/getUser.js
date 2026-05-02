const config = require("config");
const jwt = require("jsonwebtoken");

// Middleware for getting user from authorization token
const getUser = async (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    const authToken = req.get("authorization").split(" ")[1];
    try {
      // Get JWT secret from environment or config
      const jwtSecret = process.env.JWT_SECRET || config.get("jwtSecret");
      
      // Log first 10 chars of secret for debugging (only in development)
      if (process.env.NODE_ENV !== 'production') {
        console.log("JWT_SECRET (first 10 chars):", jwtSecret.substring(0, 10));
      }
      
      const decode = await jwt.verify(authToken, jwtSecret);
      req.user = decode;
      return next();
    } catch (e) {
      console.error("JWT verification error:", e.message);
      return res.status(400).json({ error: "Authorization Token is invalid", details: e.message });
    }
  }
  return res.status(400).json({ error: "Authorization Token not provided" });
};

module.exports = getUser;
