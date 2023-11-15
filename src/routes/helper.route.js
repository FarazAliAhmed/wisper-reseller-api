const express = require("express");
const {
  changeSubdealerToAgents,
  updateDefaultMegaPrice,
} = require("../controllers/helper.controller");
const getAdmin = require("../utils/middleware/getAdmin");

const router = express.Router();

router.post("/changeToAgent", getAdmin, changeSubdealerToAgents);
router.post("/updateMegaPrice", getAdmin, updateDefaultMegaPrice);

module.exports = router;
