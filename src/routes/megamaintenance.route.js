const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const {
  createMegaMaintenance,
  enterMegaMaintenance,
  setMegaNoticeMessag,
  exitMegaMaintenance,
  clearMegaNoticeMessag,
} = require("../controllers/megaMaintenance.controller");
const router = express.Router();

router.post("/admin/megaMaintenance/create", getAdmin, createMegaMaintenance);
router.patch(
  "/admin/megaMaintenance/enter/:network",
  getAdmin,
  enterMegaMaintenance
);
router.patch(
  "/admin/megaMaintenance/exit/:network",
  getAdmin,
  exitMegaMaintenance
);
router.post("/admin/megaMaintenance/notice", getAdmin, setMegaNoticeMessag);
router.get("/admin/megaMaintenance/clear", getAdmin, clearMegaNoticeMessag);

module.exports = router;
