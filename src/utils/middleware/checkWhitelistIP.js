const { Account } = require("../../models/account");
const jwt = require("jsonwebtoken");

const checkWhitelistIP = async (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const authToken = req.get("authorization").split(" ")[1];

      const decode = await jwt.verify(authToken, config.get("jwtSecret"));
      const user = decode;

      // Get the user from the database to access the whitelist information
      const dbUser = await Account.findById(user._id);

      if (dbUser.whitelistStatus) {
        // Check if the user's IP matches any whitelisted IP

        // Check for x-forwarded-for header (common in proxies and load balancers)
        const xForwardedFor = req.headers["x-forwarded-for"];
        if (xForwardedFor) {
          const userIP = xForwardedFor.split(",")[0].trim();
          if (dbUser.whitelistIP.includes(userIP)) {
            // Proceed with the middleware if the user's IP is whitelisted
            return next();
          }
        }

        // Check for the direct connection IP
        const connectionIP = req.connection.remoteAddress.slice(7);
        if (dbUser.whitelistIP.includes(connectionIP)) {
          // Proceed with the middleware if the user's IP is whitelisted
          return next();
        }

        // Return an error if the user's IP is not found in the whitelist
        return res.status(403).json({ error: "IP not found in the whitelist" });
      }

      // If whitelistStatus is false, proceed with the middleware
      return next();
    }

    return res.status(400).json({ error: "Authorization Token is invalid" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = checkWhitelistIP;
