const webhook = require("../models/webhook");
const webhookService = require("../services/webhook.service");
const Joi = require("joi");

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
    // Define the validation schema
    const schema = Joi.object({
      url: Joi.string().uri().required(),
    });

    try {
      // Validate the request body
      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { url } = value;

      // Find the existing webhook or create a new one
      const updatedWebhook = await webhook.findOneAndUpdate(
        { business_id: req.user._id },
        { url },
        { new: true, upsert: true }
      );

      const message = updatedWebhook.isNew
        ? "Webhook URL created successfully"
        : "Webhook URL updated successfully";

      res.status(200).json({ message, data: updatedWebhook });
    } catch (error) {
      console.error("Error saving/updating webhook URL:", error);
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
    let doc = null;
    try {
      doc = await webhook.findOne({
        business_id: req.user._id,
      });
      res.status(200).json(doc);
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
