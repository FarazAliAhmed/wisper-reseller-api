const express = require("express");
const {
  changeSubdealerToAgents,
  updateDefaultMegaPrice,
  filterAndLeaveOneBalanceForAllAccounts,
  filterAndLeaveOneZeroAcount,
} = require("../controllers/helper.controller");
const getAdmin = require("../utils/middleware/getAdmin");

const router = express.Router();

router.post("/changeToAgent", getAdmin, changeSubdealerToAgents);
router.post("/updateMegaPrice", getAdmin, updateDefaultMegaPrice);
router.post(
  "/filterAndLeaveOneBalanceForAllAccounts",
  getAdmin,
  filterAndLeaveOneBalanceForAllAccounts
);
router.post(
  "/filterAndLeaveOneZeroAcount",
  getAdmin,
  filterAndLeaveOneZeroAcount
);

module.exports = router;
