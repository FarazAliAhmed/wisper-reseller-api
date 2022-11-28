require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const cors = require("cors");
const compression = require('compression');
const app = express();
const config = require("config");
const dbSetUp = require("./models");
const pino = require('pino-http');
const { errors } = require('celebrate');

const PORT = config.get("port");

const getAdmin = require('./utils/middleware/getAdmin');
const getUser = require('./utils/middleware/getUser');

const apiRoutes = require("./routes");
const apiV2Routes = require('./routes/v2');
const apiV2AdminRoutes = require('./routes/v2/admin')
const hookRoute = require("./routes/hooks")
const corsOptions = {
  origin: '*'
}

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if(process.env.NODE_ENV !== 'production'){
  app.use(pino());
}

app.get("/", (req, res) => {
  res.status(200).send({ status: "healthy" });
});
app.use("/api", apiRoutes);
app.use("/api/v2", getUser, apiV2Routes);
app.use("/api/v2/admin", getAdmin, apiV2AdminRoutes);
app.use("/hook", hookRoute);

app.use(errors());

dbSetUp();
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
