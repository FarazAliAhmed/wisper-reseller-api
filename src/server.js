require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const app = express();
const config = require("config");
const dbSetUp = require("./models");
const pino = require("pino-http");
const { errors } = require("celebrate");

const PORT = config.get("port") || 5000;

const getAdmin = require("./utils/middleware/getAdmin");
const getUser = require("./utils/middleware/getUser");

const apiRoutes = require("./routes");
const notiRoutes = require("./routes/notification.route");
const apiV2Routes = require("./routes/v2");
const apiV2AdminRoutes = require("./routes/v2/admin");
const hookRoute = require("./routes/hooks");
const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

// white listing of Ip
// IP whitelist middleware
function ipWhitelist(allowedIPs) {
  return function (req, res, next) {
    // const clientIP =
    //   req.headers["x-forwarded-for"] || req.connection.remoteAddress || "";

    // const [ipv6MappedIPv4, ipv6] = clientIP.split(":");
    // const firstIP = ipv6MappedIPv4 || ipv6 || clientIP;

    const clientIP = req.ip.split(":").pop();

    console.log("IP ADDRESS", clientIP);

    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      // IP is not allowed, send a 403 Forbidden response

      console.log("Access denied: Your IP is not whitelisted.");
      res
        .status(403)
        .json({ error: "Access denied: Your IP is not whitelisted." });
    }
  };
}

// Define an array of allowed IPs
const allowedIPs = ["10.6", "99.5"];

// Apply the IP whitelist middleware to specific routes or all routes
app.use(ipWhitelist(allowedIPs));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV !== "production") {
  app.use(pino());
}

app.get("/", (req, res) => {
  res.status(200).send({ status: "healthy" });
});
app.use("/api", apiRoutes);
app.use("/api", notiRoutes);
app.use("/api/v2", getUser, apiV2Routes);
app.use("/api/v2/admin", getAdmin, apiV2AdminRoutes);
app.use("/hook", hookRoute);

app.use(errors());

dbSetUp();
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
