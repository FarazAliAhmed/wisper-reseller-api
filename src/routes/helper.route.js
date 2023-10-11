const express = require("express");
const { changeSubdealerToAgents } = require("../controllers/helper.controller");
const getAdmin = require("../utils/middleware/getAdmin");

const router = express.Router();

router.post("/changeToAgent", getAdmin, changeSubdealerToAgents);

module.exports = router;
