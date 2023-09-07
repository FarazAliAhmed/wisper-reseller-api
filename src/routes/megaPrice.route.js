const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const megaPriceController = require("../controllers/megaPrice.controller");
const getUser = require("../utils/middleware/getUser");
const router = express.Router();

router.post("/editMegaPrice", megaPriceController.updateMegaPrice);
router.post("/purchaseMegaData", megaPriceController.purchaseMegaData);
router.get(
  "/getMegaPriceUser/:id",

  megaPriceController.getMegaPriceUser
);
router.get(
  "/getMegaHistory/:id",

  megaPriceController.getPurchaseHistory
);

module.exports = router;
