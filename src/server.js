require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const app = express();
const config = require("config");
const dbSetUp = require("./models");
const pino = require("pino-http");
const { errors } = require("celebrate");
const cron = require("node-cron");

const PORT = config.get("port") || 5000;

const getAdmin = require("./utils/middleware/getAdmin");
const getUser = require("./utils/middleware/getUser");

const apiRoutes = require("./routes");
const notiRoutes = require("./routes/notification.route");
const subdealerRoutes = require("./routes/subdealer.route");
const megaPriceRoutes = require("./routes/megaPrice.route");
const monnifyRoutes = require("./routes/monnify.route");
const megamaintenanceRoutes = require("./routes/megamaintenance.route");
const storeFrontRoutes = require("./routes/storeFront.route.js");

const apiV2Routes = require("./routes/v2");
const apiV2AdminRoutes = require("./routes/v2/admin");
const hookRoute = require("./routes/hooks");
const {
  populateBucketUsage,
  populateStartWalletUsage,
  populateWalletUsage,
} = require("./controllers/analysis.controller");
const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
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
app.use("/api/subdealer", subdealerRoutes);
app.use("/api", megaPriceRoutes);
app.use("/api", monnifyRoutes);
app.use("/api", megamaintenanceRoutes);
app.use("/api", storeFrontRoutes);

app.use("/api/v2", getUser, apiV2Routes);
app.use("/api/v2/admin", getAdmin, apiV2AdminRoutes);
app.use("/hook", hookRoute);

// */1 * * * *"
// ("0 1 * * *");
// "0 3 * * *"
cron.schedule("*/1 * * * *", async () => {
  try {
    await populateBucketUsage();
    console.log("populateBucketUsage executed every 1 minutes.");
  } catch (error) {
    console.error("Error executing populateBucketUsage:", error);
  }
});

// Schedule for 12:01 AM (midnight)
cron.schedule("1 0 * * *", async () => {
  try {
    await populateStartWalletUsage();
    console.log("populateStartWalletUsage executed at 12:01 AM.");
  } catch (error) {
    console.error("Error executing populateStartWalletUsage:", error);
  }
});

// Schedule for 11:59 PM
cron.schedule("59 23 * * *", async () => {
  try {
    await populateWalletUsage();
    console.log("populateWalletUsage executed at 11:59 PM.");
  } catch (error) {
    console.error("Error executing populateWalletUsage:", error);
  }
});

// Define the first cron job (task1) to run every minute
// const task1 = cron.schedule("* * * * *", async () => {
//   console.log("Task 1 executed");
//   await populateStartWalletUsage();
//   task1.stop();
// });

// task1.start();

// Define the second cron job (task2) to run immediately after task1
// const task2 = cron.schedule("* * * * *", async () => {
//   console.log("Task 2 executed");
//   await populateWalletUsage();
//   task2.stop();
// });

// task2.start();

app.use(errors());

dbSetUp();
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
