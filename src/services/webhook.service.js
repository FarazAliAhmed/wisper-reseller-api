/* eslint-disable no-useless-catch */
const axios = require("axios");
const monnifyHistory = require("../models/monnifyHistory");
const Transaction = require("../models/transactionHistory");

class WebhookService {
  async N3tdataWebhook(addData) {
    try {
      let parsedData;

      // If addData is improperly formatted as shown in your logs:
      const key = Object.keys(addData)[0]; // Extract the first key (which is the JSON string)

      try {
        // Parse the key as JSON since it seems to be a stringified JSON
        parsedData = JSON.parse(key);
      } catch (error) {
        console.error("Failed to parse Webhook data:", error);
        throw new Error("Failed to parse incoming Webhook data.");
      }

      console.log({ parsedData });

      // Extract the required fields from the parsed JSON object
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
}

module.exports = new WebhookService();
