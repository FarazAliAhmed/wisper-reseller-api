const axios = require("axios");
const dataBalance = require("../models/dataBalance");
const monnifyHistory = require("../models/monnifyHistory");
const { Account } = require("../models/account");

class MonnifyService {
  async addBalanceByBusinessId(addData) {
    try {
      // Check if the reference exists in monnifyHistory
      const existingReference = await monnifyHistory.findOne({
        payment_ref: addData.eventData.transactionReference,
      });

      if (existingReference) {
        return { message: "Reference already exists in monnifyHistory" };
      }

      const balance = await dataBalance.findOne({
        business: addData.eventData.product.reference,
      });

      if (!balance) {
        throw new Error("Balance record not found");
      }

      // Update wallet_balance and last_purchase fields

      // const resolvedBalance = Number(addData.eventData.settlementAmount) - 50;
      const resolvedBalance = Number(addData.eventData.amountPaid) - 50;

      const old_bal = balance.wallet_balance;

      if (Number(addData.eventData.amountPaid) > 50) {
        // balance.wallet_balance += resolvedBalance;

        await dataBalance.findOneAndUpdate(
          { business: addData.eventData.product.reference },
          {
            $inc: {
              wallet_balance: resolvedBalance,
            },
            last_purchase: new Date(),
          },
          { new: true }
        );

        // balance.last_purchase = new Date();
      } else {
        await dataBalance.findOneAndUpdate(
          { business: addData.eventData.product.reference },
          {
            $inc: {
              wallet_balance: 0,
            },
            last_purchase: new Date(),
          },
          { new: true }
        );
      }

      let new_bal = 0;

      if (Number(addData.eventData.amountPaid) > 50) {
        new_bal = Number(old_bal) + Number(resolvedBalance);
      }

      const newMonnifyHistory = new monnifyHistory({
        business_name: addData.eventData.customer.name,
        business_id: addData.eventData.product.reference,
        amount: resolvedBalance,
        resolvedAmount: resolvedBalance,
        new_bal: `${new_bal}`,
        old_bal: old_bal,
        purpose: "Funding - Monnify",
        desc: `Deposit of ${resolvedBalance} NGN made by ${addData.eventData.customer.name}.`,
        bankAccountNum:
          addData.eventData.destinationAccountInformation.accountNumber,
        bank: addData.eventData.destinationAccountInformation.bankName,
        pay_type: "credit",
        date_of_payment: addData.eventData.paidOn,
        payment_ref: addData.eventData.transactionReference,
      });

      await balance.save();
      await newMonnifyHistory.save();

      return newMonnifyHistory;
    } catch (error) {
      throw error;
    }
  }

  async addBalanceByBusinessIdAdmin(addData) {
    try {
      const balance = await dataBalance.findOne({
        business: addData.business_id,
      });
      const user = await Account.findOne({
        _id: addData.business_id,
      });

      if (!balance) {
        throw new Error("Balance record not found");
      }
      if (!user) {
        throw new Error("User record not found");
      }

      const old_bal = balance.wallet_balance;

      // balance.wallet_balance += Number(addData.amount);
      // balance.last_purchase = new Date();

      await dataBalance.findOneAndUpdate(
        { business: addData.business_id },
        {
          $inc: {
            wallet_balance: Number(addData.amount),
          },
          last_purchase: new Date(),
        },
        { new: true }
      );

      const new_bal = Number(old_bal) + Number(addData.amount);

      const newMonnifyHistory = new monnifyHistory({
        business_name: user.name,
        business_id: addData.business_id,
        amount: addData.amount,
        resolvedAmount: balance.wallet_balance,
        new_bal: `${new_bal}`,
        old_bal: old_bal,
        purpose: "Funding - Admin",
        desc: `Deposit of ${addData.amount} NGN made by ${user.name}.`,
        pay_type: "credit",
        date_of_payment: new Date(),
        payment_ref: "AD-trx-" + Math.floor(Math.random() * 10000000000000000),
      });

      await balance.save();
      await newMonnifyHistory.save();

      return newMonnifyHistory;
    } catch (error) {
      throw error;
    }
  }

  async debitBalanceByBusinessIdAdmin(addData) {
    try {
      const balance = await dataBalance.findOne({
        business: addData.business_id,
      });
      const user = await Account.findOne({
        _id: addData.business_id,
      });

      if (!balance) {
        throw new Error("Balance record not found");
      }
      if (!user) {
        throw new Error("User record not found");
      }

      const old_bal = balance.wallet_balance;

      // balance.wallet_balance -= Number(addData.amount);
      // balance.last_purchase = new Date();

      await dataBalance.findOneAndUpdate(
        { business: addData.business_id },
        {
          $inc: {
            wallet_balance: -Number(addData.amount),
          },
          last_purchase: new Date(),
        },
        { new: true }
      );

      const new_bal = Number(old_bal) - Number(addData.amount);

      const newMonnifyHistory = new monnifyHistory({
        business_name: user.username,
        business_id: addData.business_id,
        amount: addData.amount,
        resolvedAmount: balance.wallet_balance,
        new_bal: `${new_bal}`,
        old_bal: old_bal,
        purpose: "Debit - Admin",
        desc: `Deposit of ${balance.wallet_balance} NGN made by ${user.name}.`,
        pay_type: "credit",
        date_of_payment: new Date(),
        payment_ref: "AD-trx-" + Math.floor(Math.random() * 10000000000000000),
      });

      await balance.save();
      await newMonnifyHistory.save();

      return newMonnifyHistory;
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
      .limit(limVal)
      .sort({ createdAt: -1 })
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

      const newBankAcct = [];

      for (const account of accounts) {
        const bankInfo = {
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          accountName: account.accountName,
        };
        // await user.addBankAccount(bankInfo);
        newBankAcct.push(bankInfo);
      }

      await Account.findOneAndUpdate(
        { email: customerEmail },
        { $push: { bankAccounts: { $each: newBankAcct } } },
        { new: true }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("An error occurred In monnify");
    }
  }
}

module.exports = new MonnifyService();
