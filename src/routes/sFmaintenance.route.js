const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");

const {
  getStoreFrontMaintenance,
  createStoreFrontMaintenance,
  enterStoreFrontMaintenance,
  exitStoreFrontMaintenance,
  setStoreFrontNoticeMessag,
  clearStoreFrontNoticeMessag,
} = require("../controllers/storeFrontMaintenance.controller");
const router = express.Router();

router.get("/admin/getSFMaintenance", getStoreFrontMaintenance);
router.post(
  "/admin/sFMaintenance/create",
  getAdmin,
  createStoreFrontMaintenance
);
router.post(
  "/admin/sFMaintenance/enter/:network",
  getAdmin,
  enterStoreFrontMaintenance
);
router.post(
  "/admin/sFMaintenance/exit/:network",
  getAdmin,
  exitStoreFrontMaintenance
);
router.post("/admin/sFMaintenance/notice", getAdmin, setStoreFrontNoticeMessag);
router.post(
  "/admin/sFMaintenance/clear",
  getAdmin,
  clearStoreFrontNoticeMessag
);

module.exports = router;
