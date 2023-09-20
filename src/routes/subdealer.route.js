const express = require("express");
const {
  createSubdealer,
  getAllSubdealers,
  SubdealerGetPurchaseHistory,
  SubdealerPurchaseMegaData,
} = require("../controllers/subdealer.controller");

const router = express.Router();

router.post("/createSubdealer", createSubdealer);
router.get("/getAllSubdealersId/:id", getAllSubdealers);
router.get("/getSubdealerHistory/:id", SubdealerGetPurchaseHistory);
router.post("/allocateData", SubdealerPurchaseMegaData);

module.exports = router;
