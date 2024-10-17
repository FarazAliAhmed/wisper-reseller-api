/* eslint-disable no-useless-catch */
const axios = require("axios");
const monnifyHistory = require("../models/monnifyHistory");
const Transaction = require("../models/transactionHistory");

class WebhookService {
  async N3tdataWebhook(addData) {
    try {
      // const wispa_mobile = await this.endsWithWispa(
      //   addData.eventData.product.reference
      // );

      // console.log({ wispa_mobile });

      // if (wispa_mobile) {
      //   axios.post("https://wispa.up.railway.app/api/monnify/webhook", addData);

      //   console.log({ message: "forwarded to wispa_mobile api" });

      //   return { message: "forwarded to wispa_mobile api" };
      // }

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
