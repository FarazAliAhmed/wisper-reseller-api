const express = require("express");
const router = express.Router();
const getAdmin = require("../utils/middleware/getAdmin");
const getUser = require("../utils/middleware/getUser");
const gloCreditController = require("../controllers/gloCredit.controller");

router.get("/glo-credit", getUser, gloCreditController.getGloCredit);
router.post("/glo-credit/repay", getUser, gloCreditController.repayGloCredit);
router.get("/admin/glo-credit", getAdmin, gloCreditController.adminListGloCredit);
router.get("/admin/glo-credit/:id", getAdmin, gloCreditController.adminGetGloCredit);

module.exports = router;
