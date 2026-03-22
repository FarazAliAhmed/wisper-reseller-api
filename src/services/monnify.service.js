/* eslint-disable no-useless-catch */
const axios = require("axios");
const dataBalance = require("../models/dataBalance");
const monnifyHistory = require("../models/monnifyHistory");
const { Account } = require("../models/account");

class MonnifyService {
  getApiUrl(path) {
    const baseUrl = process.env.MONNIFY_BASE_URL?.replace(/\/$/, "");
    return `${baseUrl}/api${path}`;
  }

  async addBalanceByBusinessId(addData) {
    try {
      const wispa_mobile = await this.endsWithWispa(
        addData.eventData.product.reference
      );

      const wispa_datashare = await this.endsWithWispaDatashare(
        addData.eventData.product.reference
      );

      if (wispa_datashare) {
        try {
          axios.post(
            "https://datashare-wisper.up.railway.app/api/monnify/webhook",
            addData
          );
        } catch (error) {
          console.log("error occured in datashare webhook");
        }

        console.log({ message: "forwarded to wispa_datashare api" });

        return { message: "forwarded to wispa_datashare api" };
      }

      if (wispa_mobile) {
        try {
          axios.post(
            "https://wispa.up.railway.app/api/monnify/webhook",
            addData
          );
        } catch (error) {
          console.log("error occured in wispa_mobile webhook");
        }

        console.log({ message: "forwarded to wispa_mobile api" });

        return { message: "forwarded to wispa_mobile api" };
      }

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
        business_name: user.username,
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
        this.getApiUrl("/v1/auth/login"),
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

  async verifyBVN(bvn, dateOfBirth) {
    try {
      const accessToken = await this.generateAccessToken();

      const response = await axios.post(
        this.getApiUrl("/v1/vas/bvn-details-match"),
        {
          bvn: bvn,
          dateOfBirth: dateOfBirth, // Format: DD-MM-YYYY
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: response.data.requestSuccessful,
        data: response.data.responseBody,
      };
    } catch (error) {
      console.error("BVN verification error:", error?.response?.data || error.message);
      return {
        success: false,
        error: error?.response?.data?.responseMessage || "BVN verification failed",
      };
    }
  }

 async createAccount(
  accountReference,
  accountName,
  customerEmail,
  customerName,
  bvn,
  nin
 ) {
  try {
    const accessToken = await this.generateAccessToken();

    // Check if account already exists
    const accountDetails = await this.getAccountDetails(accountReference, accessToken);

    if (accountDetails?.responseBody?.status === "ACTIVE") {
      console.log("Monnify account already exists, updating bank accounts");
      
      await Account.findOneAndUpdate(
        { email: customerEmail },
        { $set: { bankAccounts: accountDetails.responseBody.accounts } },
        { new: true }
      );

      return { message: "Account already exists", data: accountDetails.responseBody };
    }

    // Create new Monnify account - exactly like Analytic-os
    const payload = {
      accountReference,
      accountName,
      currencyCode: "NGN",
      contractCode: process.env.MONNIFY_CONTRACT_CODE,
      customerEmail,
      customerName,
      getAllAvailableBanks: true,
    };

    // Add BVN or NIN if provided (send correct field based on what user provided)
    if (bvn) {
      payload.bvn = bvn;
      console.log("Creating Monnify account with BVN");
    } else if (nin) {
      payload.nin = nin;
      console.log("Creating Monnify account with NIN");
    } else {
      console.log("Creating Monnify account without BVN/NIN");
    }

    const response = await axios.post(
      this.getApiUrl("/v2/bank-transfer/reserved-accounts"),
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { accounts } = response.data.responseBody;

    if (!accounts || accounts.length === 0) {
      throw new Error("No bank accounts returned from Monnify");
    }

    console.log(`Monnify returned ${accounts.length} bank accounts:`, accounts.map(a => a.bankName).join(', '));

    const user = await Account.findOne({ email: customerEmail });
    if (!user) throw new Error("User not found");

    const newBankAcct = accounts.map(account => ({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
    }));

    await Account.findOneAndUpdate(
      { email: customerEmail },
      { $set: { bankAccounts: newBankAcct } },
      { new: true }
    );

    console.log("Monnify account created successfully");

    return response.data;
  } catch (error) {
    const monnifyError =
      error?.response?.data?.responseMessage ||
      error?.response?.data?.error_description ||
      error?.response?.data?.message ||
      error.message;

    console.error("Monnify createAccount error:", monnifyError);
    
    throw new Error(monnifyError);
  }
}



async getAccountDetails(accountReference, accessToken) {
  try {
    const response = await axios.get(
      this.getApiUrl(`/v2/bank-transfer/reserved-accounts/${accountReference}`),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; 
  } catch (error) {
    if (error?.response?.status === 404) {
      // account does not exist
      return null;
    }

   
    console.error("Monnify error in getAccountDetails:", error?.response?.data);
    throw new Error("Monnify getAccountDetails failed");
  }
}

async updateKycInfo(accountReference, accessToken, { bvn, nin }) {
  if (!bvn && !nin) {
    return null;
  }

  const payload = {};

  // Only send one - prefer BVN
  if (bvn) {
    payload.bvn = bvn;
  } else if (nin) {
    payload.nin = nin;
  }

  try {
    const response = await axios.put(
      this.getApiUrl(`/v1/bank-transfer/reserved-accounts/${accountReference}/kyc-info`),
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("KYC update error:", error?.response?.data || error.message);
    // Don't throw, just log - KYC update is not critical
    return null;
  }
}

async endsWithWispa(reference) {
  try {
    const user = await Account.findById(reference);
    return user?.isWispaMobile === true;
  } catch (error) {
    return false;
  }
}

async endsWithWispaDatashare(reference) {
  try {
    const user = await Account.findById(reference);
    return user?.isWispaDatashare === true;
  } catch (error) {
    return false;
  }
}
}


module.exports = new MonnifyService();
