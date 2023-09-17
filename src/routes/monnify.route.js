const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const monnifyController = require("../controllers/monnify.controller");
const router = express.Router();

router.post("/monnifyAddBalance", monnifyController.addBalance);
router.post(
  "/monnifyAdminAddBalance",
  getAdmin,
  monnifyController.addBalanceAdmin
);
router.get("/monnifyGetAccount", monnifyController.getAccountDetails);
router.post("/monnifyCreateAccount", monnifyController.createAccount);
router.post("/monnifyAllAccount", monnifyController.createAllMonifyAccount);
router.post("/monnifyDeleteAccount", monnifyController.deleteAccount);
router.post("/monnifyDeleteAllAccount", monnifyController.deleteAllAccount);
router.post("/monnifyGetAll", monnifyController.getAllTransaction);
router.get("/getMonnifyTrx/:id", monnifyController.getAllTransaction);

module.exports = router;
