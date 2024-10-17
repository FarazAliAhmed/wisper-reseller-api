/* eslint-disable no-useless-catch */
const axios = require("axios");
const monnifyHistory = require("../models/monnifyHistory");
const Transaction = require("../models/transactionHistory");

class WebhookService {
  async N3tdataWebhook(addData) {
    try {
      // Check if the incoming data is a string (if so, it needs parsing)
      if (typeof addData === "string") {
        try {
          // Parse the incoming string data into a proper JSON object
          addData = JSON.parse(addData);
        } catch (error) {
          throw new Error("Failed to parse incoming Webhook data.");
        }
      }

      console.log({ addData });
      console.log({ statusAddData: addData?.status });
      console.log({ requestIdAddData: addData["request-id"] });

      // Check if the reference exists in monnifyHistory
      const existingReference = await Transaction.findOne({
        transaction_ref: addData["request-id"],
      });

      if (!existingReference) {
        return { message: "Transaction Reference does not exist" };
      }

      if (!addData?.status) {
        throw new Error("no status found in body");
      }

      if (addData?.status == "success") {
        console.log("webhook status success");

        return await Transaction.findOneAndUpdate(
          { transaction_ref: addData["request-id"] },
          {
            status: "success",
          },
          { new: true }
        );
      }

      if (addData?.status == "fail") {
        console.log("webhook status failed");

        return await Transaction.findOneAndUpdate(
          { transaction_ref: addData["request-id"] },
          {
            status: "failed",
          },
          { new: true }
        );
      }

      console.log("webhook status pending");

      return await Transaction.findOneAndUpdate(
        { transaction_ref: addData["request-id"] },
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
