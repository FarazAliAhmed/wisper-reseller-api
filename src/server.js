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
const { populateBucketUsage } = require("./controllers/analysis.controller");
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
cron.schedule("0 3 * * *", async () => {
  try {
    await populateBucketUsage();
    console.log("populateBucketUsage executed every 1 minutes.");
  } catch (error) {
    console.error("Error executing populateBucketUsage:", error);
  }
});

// app.delete("/deletetrx", async (req, res) => {
//   try {
//     const transactionsToDelete = await transactionHistory.find().limit(70000);

//     const transactionIdsToDelete = transactionsToDelete.map(
//       (transaction) => transaction._id
//     );

//     await transactionHistory.deleteMany({
//       _id: { $in: transactionIdsToDelete },
//     });

//     res.status(200).json({ message: "First 70000 transactions deleted" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "An error occurred" });
//   }
// });

// app.delete("/deletetrx", async (req, res) => {
//   try {
//     // Find all Account documents
//     const accounts = await Account.find();

//     // Loop through each Account and create a corresponding dataBalance if it doesn't exist
//     for (const account of accounts) {
//       const businessId = account._id;

//       // Check if a dataBalance document already exists for this businessId
//       const existingDataBalance = await dataBalance.findOne({
//         business: businessId,
//       });

//       if (!existingDataBalance) {
//         // Create a new dataBalance document with the same business as the account _id
//         const newDataBalance = new dataBalance({
//           business: businessId,
//         });

//         // Save the new dataBalance document
//         await newDataBalance.save();
//       }
//     }

//     res
//       .status(200)
//       .json({ message: "Deleted all duplicates field", aggregationResult });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "An error occurred" });
//   }
// });

app.use(errors());

dbSetUp();
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
