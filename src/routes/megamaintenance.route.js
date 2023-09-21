const express = require("express");

const getAdmin = require("../utils/middleware/getAdmin");
const {
  createMegaMaintenance,
  enterMegaMaintenance,
  setMegaNoticeMessag,
  exitMegaMaintenance,
  clearMegaNoticeMessag,
  getMegaMaintenance,
} = require("../controllers/megaMaintenance.controller");
const router = express.Router();

router.get("/admin/getMegaMaintenance", getMegaMaintenance);
router.post("/admin/megaMaintenance/create", getAdmin, createMegaMaintenance);
router.post(
  "/admin/megaMaintenance/enter/:network",
  getAdmin,
  enterMegaMaintenance
);
router.post(
  "/admin/megaMaintenance/exit/:network",
  getAdmin,
  exitMegaMaintenance
);
router.post("/admin/megaMaintenance/notice", getAdmin, setMegaNoticeMessag);
router.post("/admin/megaMaintenance/clear", getAdmin, clearMegaNoticeMessag);

module.exports = router;
