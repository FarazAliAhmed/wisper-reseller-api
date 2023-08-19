const axios = require("axios");
const dataBalance = require("../models/dataBalance");
const monnifyHistory = require("../models/monnifyHistory");

class MonnifyService {
  async addBalanceByBusinessId(addData) {
    try {
      const balance = await dataBalance.findOne({ business: addData.business });

      if (!balance) {
        throw new Error("Balance record not found");
      }

      // Update wallet_balance and last_purchase fields
      balance.wallet_balance += addData.amount;
      balance.last_purchase = new Date();

      const updatedBalance = await balance.save();

      const newMonnifyHistory = new monnifyHistory({
        business_name: addData.eventData.customer.name,
        business_id: addData.eventData.reference,
        amount: addData.eventData.settlementAmount,
        bankAccountNum:
          addData.eventData.destinationAccountInformation.accountNumber,
        bank: addData.eventData.destinationAccountInformation.bankName,
        pay_type: addData.eventData.paymentMethod,
        date_of_payment: addData.eventData.paidOn,
        payment_ref: addData.eventData.transactionReference,
      });
      await newMonnifyHistory.save();

      return updatedBalance;
    } catch (error) {
      throw error;
    }
  }

  async generateAccessToken() {
    console.log("Generating access token for Monnify");

    const credentials = `${process.env.MONNIFY_USERNAME}:${process.env.MONNIFY_PASSWORD}`;
    const encodedCredentials = Buffer.from(credentials).toString("base64");

    try {
      const response = await axios.post(
        `${process.env.MONNIFY_BASE_URL}/v1/auth/login`,
        {},
        {
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log(response.data);
      return response.data.responseBody.accessToken;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = new MonnifyService();
