const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const config = require("config");
const dbSetUp = require("./models");

const PORT = config.get("port");

const apiRoutes = require("./routes");

app.use(compression);
app.use(morgan("combined"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send({ status: "healthy" });
});
app.use("/api", apiRoutes);

dbSetUp();
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
