const express = require("express");
const {
  confirmEmail,
  resendConfirmEmail,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/confirmEmail", confirmEmail);

router.post("/resendConfirmEmail", resendConfirmEmail);

module.exports = router;
