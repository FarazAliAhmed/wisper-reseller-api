const express = require("express");
const cors = require("cors");
const app = express();
const { PORT } = require("./config");
const dbSetUp = require("./models");

const routes = require("./routes");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use("/api", routes);

dbSetUp();
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
