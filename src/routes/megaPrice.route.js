const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const megaPriceController = require("../controllers/megaPrice.controller");
const getUser = require("../utils/middleware/getUser");
const router = express.Router();

router.post("/editMegaPrice", getAdmin, megaPriceController.updateMegaPrice);
router.post("/purchaseMegaData", getUser, megaPriceController.purchaseMegaData);
router.get(
  "/getMegaPriceUser/:id",
  getUser,
  megaPriceController.getMegaPriceUser
);
router.get(
  "/getMegaHistory/:id",
  getUser,
  megaPriceController.getPurchaseHistory
);
router.get(
  "/getAllMegaHistory",
  getAdmin,
  megaPriceController.getPurchaseHistoryAdmin
);
router.post(
  "/defaultPrice",
  getAdmin,
  megaPriceController.createDefaultMegaPrice
);

module.exports = router;
