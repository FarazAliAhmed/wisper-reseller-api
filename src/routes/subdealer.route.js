const express = require("express");
const {
  createSubdealer,
  getAllSubdealers,
  SubdealerGetPurchaseHistory,
  SubdealerPurchaseMegaData,
  getSubdealerInfo,
} = require("../controllers/subdealer.controller");

const router = express.Router();

router.get("/getSubdealersInfo/:id", getSubdealerInfo);
router.post("/createSubdealer", createSubdealer);
router.get("/getAllSubdealersId/:id", getAllSubdealers);
router.get("/getSubdealerHistory/:id", SubdealerGetPurchaseHistory);
router.post("/allocateData", SubdealerPurchaseMegaData);

module.exports = router;
