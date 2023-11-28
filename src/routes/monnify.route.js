const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const monnifyController = require("../controllers/monnify.controller");
const getUser = require("../utils/middleware/getUser");
const router = express.Router();

router.post("/monnifyAddBalance", monnifyController.addBalance);
router.post(
  "/monnifyAdminAddBalance",

  monnifyController.addBalanceAdmin
);
router.post(
  "/monnifyAdminDebitBalance",

  monnifyController.debitBalanceAdmin
);
router.get("/monnifyGetAccount", getUser, monnifyController.getAccountDetails);
router.post("/monnifyCreateAccount", getAdmin, monnifyController.createAccount);
router.post(
  "/monnifyAllAccount",
  getAdmin,
  monnifyController.createAllMonifyAccount
);
router.post("/monnifyDeleteAccount", getAdmin, monnifyController.deleteAccount);
router.post(
  "/monnifyDeleteAllAccount",
  getAdmin,
  monnifyController.deleteAllAccount
);
router.get("/getMonnifyTrx/:id", getUser, monnifyController.getAllTransaction);
router.get("/monnifyGetAll", getAdmin, monnifyController.getAllMonnify);

module.exports = router;
