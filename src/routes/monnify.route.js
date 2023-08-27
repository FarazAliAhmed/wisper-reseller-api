const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const monnifyController = require("../controllers/monnify.controller");
const router = express.Router();

router.post("/monnifyAddBalance", monnifyController.addBalance);
router.get("/monnifyGetAccount", monnifyController.getAccountDetails);
router.post("/monnifyCreateAccount", monnifyController.createAccount);
router.post("/monnifyAllAccount", monnifyController.createAllMonifyAccount);
router.post("/monnifyDeleteAccount", monnifyController.deleteAccount);

module.exports = router;
