const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const monnifyController = require("../controllers/monnify.controller");
const router = express.Router();

router.post("/monnifyAddBalance", monnifyController.addBalance);

module.exports = router;
