const webhook = require("../models/webhook");
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

  async saveWebhookUrl(req, res) {
    const { userId, url } = req.body;

    try {
      // Check if the user already has a webhook registered
      const existingWebhook = await webhook.findOne({ userId });

      if (existingWebhook) {
        return res
          .status(400)
          .json({ message: "Webhook already exists for this user" });
      }

      // Create and save the webhook URL
      const newWebhook = new webhook({ userId, url });
      await newWebhook.save();

      res
        .status(201)
        .json({ message: "Webhook URL saved successfully", newWebhook });
    } catch (error) {
      console.error("Error saving webhook URL:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getAllWebhooks(req, res) {
    try {
      const webhooks = await webhook.find();
      res.status(200).json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getOneWebhook(req, res) {
    try {
      const webhook = await webhook.findOne({
        business_id: req.user._id,
      });
      res.status(200).json(webhook);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async deleteWebhookUrl(req, res) {
    const { userId } = req.params;

    try {
      const deletedWebhook = await webhook.findOneAndDelete({ userId });

      if (!deletedWebhook) {
        return res.status(404).json({ message: "Webhook URL not found" });
      }

      res.status(200).json({ message: "Webhook URL deleted successfully" });
    } catch (error) {
      console.error("Error deleting webhook URL:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new WebhookController();
