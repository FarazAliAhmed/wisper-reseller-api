const { Account } = require("../../models/account");

const checkWhitelistIP = async (req, res, next) => {
  try {
    const api_key = req.headers["x-api-key"];
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    console.log("IP ADRESS", ipAddress);

    console.log("X-FORWARDED", req.headers["x-forwarded-for"]);
    console.log("connection adreess", req.connection.remoteAddress);

    const user = await Account.findOne({
      access_token: api_key,
      whitelistIP: ipAddress,
    });

    if (user) {
      next(); // IP address matches, proceed with the request
    } else {
      res.status(403).json({ error: "Forbidden. IP not whitelisted." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = checkWhitelistIP;
