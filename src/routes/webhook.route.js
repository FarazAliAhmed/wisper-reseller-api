const express = require("express");

const webhookController = require("../controllers/webhook.controller");
const parseKey = require("../utils/middleware/parseKey");
const getAdmin = require("../utils/middleware/getAdmin");
const router = express.Router();

router.get("/getAllWebhooks", webhookController.getAllWebhooks);
router.get("/getOneWebhook", parseKey, webhookController.getOneWebhook);

router.post("/n3tdata", webhookController.n3tData);
router.post("/saveWebhookUrl", parseKey, webhookController.saveWebhookUrl);
router.post("/deleteWebhookUrl", parseKey, webhookController.deleteWebhookUrl);

module.exports = router;
