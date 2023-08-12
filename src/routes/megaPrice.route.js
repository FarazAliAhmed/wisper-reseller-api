const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const { updateMegaPrice } = require("../controllers/megaPrice.controller");
const router = express.Router();

router.post("/editMegaPrice", getAdmin, updateMegaPrice);

module.exports = router;
