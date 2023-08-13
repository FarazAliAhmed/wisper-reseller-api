const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const megaPriceController = require("../controllers/megaPrice.controller");
const getUser = require("../utils/middleware/getUser");
const router = express.Router();

router.post("/editMegaPrice", getAdmin, megaPriceController.updateMegaPrice);
router.post("/purchaseMegaData", getUser, megaPriceController.purchaseMegaData);

module.exports = router;
