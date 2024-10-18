const express = require("express");

const webhookController = require("../controllers/webhook.controller");
const getUser = require("../utils/middleware/getUser");
const router = express.Router();

router.post("/n3tdata", webhookController.n3tData);
router.post("/saveWebhookUrl", getUser, webhookController.saveWebhookUrl);
router.post("/getAllWebhooks", getUser, webhookController.getAllWebhooks);
router.post("/getOneWebhook", getUser, webhookController.getOneWebhook);
router.post("/deleteWebhookUrl", getUser, webhookController.deleteWebhookUrl);

module.exports = router;
