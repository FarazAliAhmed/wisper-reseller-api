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

router.post("/admin/getMegaMaintenance", getMegaMaintenance);
router.post("/admin/megaMaintenance/create", createMegaMaintenance);
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
