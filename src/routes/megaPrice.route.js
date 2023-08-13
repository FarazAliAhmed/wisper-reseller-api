const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const megaPriceController = require("../controllers/megaPrice.controller");
const router = express.Router();

router.post("/editMegaPrice", megaPriceController.updateMegaPrice);
router.post("/purchaseMegaData", megaPriceController.purchaseMegaData);

module.exports = router;
