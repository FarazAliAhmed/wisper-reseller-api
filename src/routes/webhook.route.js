const express = require("express");

const webhookController = require("../controllers/webhook.controller");
const router = express.Router();

router.post("/n3tdata", webhookController.n3tData);

module.exports = router;
