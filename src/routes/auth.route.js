const express = require("express");
const {
  confirmEmail,
  resendConfirmEmail,
  ResetActivationLinkEmail,
} = require("../controllers/auth.controller");

const getUser = require("../utils/middleware/getUser");

const router = express.Router();

router.post("/confirmEmail", confirmEmail);

router.post("/resendConfirmEmail", resendConfirmEmail);

router.post("/resetActivationEmail", getUser, ResetActivationLinkEmail);

module.exports = router;
