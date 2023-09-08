const axios = require("axios");
const dataBalance = require("../models/dataBalance");
const monnifyHistory = require("../models/monnifyHistory");
const { Account } = require("../models/account");

class MonnifyService {
  async addBalanceByBusinessId(addData) {
    try {
      const balance = await dataBalance.findOne({
        business: addData.eventData.product.reference,
      });

      if (!balance) {
        throw new Error("Balance record not found");
      }

      // Update wallet_balance and last_purchase fields

      const resolvedBalance = Number(addData.eventData.settlementAmount) - 53;

      const old_bal = balance.wallet_balance;

      if (Number(addData.eventData.settlementAmount) > 53) {
        balance.wallet_balance += resolvedBalance;
        balance.last_purchase = new Date();
      } else {
        balance.wallet_balance += 0;
        balance.last_purchase = new Date();
      }

      const updatedBalance = await balance.save();

      const newMonnifyHistory = new monnifyHistory({
        business_name: addData.eventData.customer.name,
        business_id: addData.eventData.product.reference,
        amount: addData.eventData.settlementAmount,
        resolvedAmount: resolvedBalance,
        new_bal: balance.wallet_balance,
        old_bal: old_bal,
        purpose: "funding",
        desc: `Deposit of ${amountToPay} NGN made by ${addData.eventData.customer.name}.`,
        bankAccountNum:
          addData.eventData.destinationAccountInformation.accountNumber,
        bank: addData.eventData.destinationAccountInformation.bankName,
        pay_type: "credit",
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

  async getAll(id, limVal) {
    const businessId = id;
    const transactions = await monnifyHistory
      .find({
        business_id: businessId,
      })
      .sort({ _id: -1 })
      .limit(limVal)
      .exec();
    if (transactions) return { transactions };
    return {
      status: 400,
      messsage: "Unable to retrieve all your Transactions",
    };
  }

  async createAccount(
    accountReference,
    accountName,
    customerEmail,
    customerName
  ) {
    try {
      const accessToken = await this.generateAccessToken();

      const response = await axios.post(
        `${process.env.MONNIFY_BASE_URL}/v2/bank-transfer/reserved-accounts`,
        {
          accountReference,
          accountName,
          currencyCode: "NGN",
          contractCode: process.env.MONNIFY_CONTRACT_CODE,
          customerEmail,
          bvn: "21212121212",
          customerName,
          getAllAvailableBanks: true,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // After receiving the API response
      const { accounts } = response.data.responseBody;

      // Assuming 'user' is the Mongoose account model instance
      // You need to fetch the user instance based on the context of your application
      const user = await Account.findOne({ email: customerEmail });

      if (!user) {
        throw new Error("User not found");
      }

      for (const account of accounts) {
        const bankInfo = {
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          accountName: account.accountName,
        };
        await user.addBankAccount(bankInfo);
      }

      return response.data;
    } catch (error) {
      console.error(error.message);
      throw new Error("An error occurred");
    }
  }
}

module.exports = new MonnifyService();
