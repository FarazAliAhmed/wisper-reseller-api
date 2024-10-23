/* eslint-disable no-useless-catch */
const axios = require("axios");
const Transaction = require("../models/transactionHistory");
const webhook = require("../models/webhook");

class WebhookService {
  async N3tdataWebhook(addData) {
    try {
      let parsedData;

      const key = Object.keys(addData)[0];

      try {
        parsedData = JSON.parse(key);
      } catch (error) {
        console.error("Failed to parse Webhook data:", error);
        throw new Error("Failed to parse incoming Webhook data.");
      }

      console.log({ parsedData });

      const transactionRef = parsedData["request-id"];
      const status = parsedData["status"];
      const response = parsedData["response"];

      console.log("Parsed Webhook Data:", { transactionRef, status, response });

      // Check if the reference exists in monnifyHistory
      const existingReference = await Transaction.findOne({
        transaction_ref: parsedData["request-id"],
      });

      if (!existingReference) {
        return { message: "Transaction Reference does not exist" };
      }

      if (!parsedData?.status) {
        throw new Error("no status found in body");
      }

      this.triggerWebhooks({
        ...parsedData,
        api_ref: existingReference?.api_ref,
      });

      if (parsedData?.status == "success") {
        console.log("webhook status success");

        return await Transaction.findOneAndUpdate(
          { transaction_ref: parsedData["request-id"] },
          {
            status: "success",
          },
          { new: true }
        );
      }

      if (parsedData?.status == "fail") {
        console.log("webhook status failed");

        return await Transaction.findOneAndUpdate(
          { transaction_ref: parsedData["request-id"] },
          {
            status: "failed",
          },
          { new: true }
        );
      }

      console.log("webhook status pending");

      return await Transaction.findOneAndUpdate(
        { transaction_ref: parsedData["request-id"] },
        {
          status: "pending",
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async triggerWebhooks(eventData) {
    console.log("trigger users webhook url");

    console.log({ eventData });

    try {
      // Fetch all registered webhooks
      const webhooks = await webhook.find();

      // console.log({ webhooks });

      // Loop over each webhook and trigger them
      const webhookPromises = webhooks.map((webhook) =>
        axios
          .post(webhook.url, eventData)
          .then((response) => {
            console.log(
              `Webhook triggered for URL: ${webhook.url} - Status: ${response.status}`
            );
          })
          .catch((error) => {
            console.error(
              `Failed to trigger webhook for URL: ${webhook.url}`,
              error.message
            );
          })
      );

      // Await all promises to ensure all webhooks are triggered
      await Promise.all(webhookPromises);

      console.log("All webhooks triggered");
    } catch (error) {
      console.error("Error triggering webhooks:", error);
    }
  }
}

module.exports = new WebhookService();
