const express = require("express");
const {
  createSubdealer,
  getAllSubdealers,
  SubdealerGetPurchaseHistory,
  SubdealerPurchaseMegaData,
  getSubdealerInfo,
  SubdealerGetPurchaseHistoryAdmin,
  getAllSubdealerAdmin
} = require("../controllers/subdealer.controller");
const getAdmin = require("../utils/middleware/getAdmin");

const router = express.Router();

router.get("/getSubdealersInfo/:id", getSubdealerInfo);
router.post("/createSubdealer", createSubdealer);
router.get("/getAllSubdealersId/:id", getAllSubdealers);
router.get("/getSubdealerHistory/:id", SubdealerGetPurchaseHistory);
router.post("/allocateData", SubdealerPurchaseMegaData);

// admin
router.get("/getSubdealersAdmin",getAdmin, getAllSubdealerAdmin);
router.get("/getSubdealerHistoryAdmin", getAdmin,SubdealerGetPurchaseHistoryAdmin);



module.exports = router;
