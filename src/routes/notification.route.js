const express = require("express");
const {
  addNotification,
  getAllNotification,
  checkAddNotification,
  addAdminNotification,
} = require("../controllers/notification.controller");
const getAdmin = require("../utils/middleware/getAdmin");
const router = express.Router();

router.post("/addNotification", addNotification);
router.post("/getAllNotification", getAllNotification);
router.post("/checkAddNotification", checkAddNotification);
router.post("/addAdminNotification", getAdmin, addAdminNotification);

module.exports = router;
