const webhookService = require("../services/webhook.service");

class WebhookController {
  async n3tData(req, res) {
    try {
      console.log("WebHook", req.body);

      const updatedTrx = await webhookService.N3tdataWebhook(req.body);

      return res.json(updatedTrx);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  }
}

module.exports = new WebhookController();
