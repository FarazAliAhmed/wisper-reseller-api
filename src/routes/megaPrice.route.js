const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const megaPriceController = require("../controllers/megaPrice.controller");
const getUser = require("../utils/middleware/getUser");
const router = express.Router();

router.post("/editMegaPrice", getAdmin, megaPriceController.updateMegaPrice);
router.post("/purchaseMegaData", megaPriceController.purchaseMegaData);
router.post("/getMegaHistory/:id", megaPriceController.getPurchaseHistory);

module.exports = router;
