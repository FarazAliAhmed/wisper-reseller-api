require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const cors = require("cors");
const app = express();
const config = require("config");
const dbSetUp = require("./models");

const PORT = config.get("port");

const apiRoutes = require("./routes");
const hookRoute = require("./routes/hooks")

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.status(200).send({ status: "healthy" });
});
app.use("/api", apiRoutes);
app.use("/hook", hookRoute)

dbSetUp();
console.log(require('./utils/networkData').plans_test)
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
