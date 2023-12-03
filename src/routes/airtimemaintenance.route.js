const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");

const {
  setAirtimeNoticeMessag,
  clearAirtimeNoticeMessag,
  exitAirtimeMaintenance,
  enterAirtimeMaintenance,
  createAirtimeMaintenance,
  getAirtimeMaintenance,
} = require("../controllers/airtimeMaintenance.controller");
const router = express.Router();

router.get("/admin/getAirtimeMaintenance", getAirtimeMaintenance);
router.post(
  "/admin/airtimeMaintenance/create",
  getAdmin,
  createAirtimeMaintenance
);
router.post(
  "/admin/airtimeMaintenance/enter/:network",
  getAdmin,
  enterAirtimeMaintenance
);
router.post(
  "/admin/airtimeMaintenance/exit/:network",
  getAdmin,
  exitAirtimeMaintenance
);
router.post(
  "/admin/airtimeMaintenance/notice",
  getAdmin,
  setAirtimeNoticeMessag
);
router.post(
  "/admin/airtimeMaintenance/clear",
  getAdmin,
  clearAirtimeNoticeMessag
);

module.exports = router;
