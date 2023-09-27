const express = require("express");
const {
  createSubdealer,
  getAllSubdealers,
  SubdealerGetPurchaseHistory,
  SubdealerPurchaseMegaData,
  getSubdealerInfo,
  SubdealerGetPurchaseHistoryAdmin,
  getAllSubdealerAdmin,
  getAllSubdealersTrx,
} = require("../controllers/subdealer.controller");
const getUser = require("../utils/middleware/getUser");
const getAdmin = require("../utils/middleware/getAdmin");

const router = express.Router();

router.get("/getSubdealersInfo/:id", getUser, getSubdealerInfo);
router.post("/createSubdealer", createSubdealer);
router.get("/getAllSubdealersId/:id", getUser, getAllSubdealers);
router.get("/getSubdealerHistory/:id", getUser, SubdealerGetPurchaseHistory);
router.post("/allocateData", getUser, SubdealerPurchaseMegaData);
router.get("/allTrx/:id", getUser, getAllSubdealersTrx);

// admin
router.get("/getSubdealersAdmin", getAdmin, getAllSubdealerAdmin);
router.get(
  "/getSubdealerHistoryAdmin",
  getAdmin,
  SubdealerGetPurchaseHistoryAdmin
);

module.exports = router;
