const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const { getAllApiBalances } = require("../controllers/api.controller");

const router = express.Router();

router.get("/getApiBalance", getAdmin, getAllApiBalances);

module.exports = router;
