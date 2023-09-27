const { Account } = require("../models/account");
var postmark = require("postmark");
const bcrypt = require("bcrypt");
const dataBalance = require("../models/dataBalance");
const megaPurchaseHistory = require("../models/megaPurchaseHistory");
const subdealerHistory = require("../models/subdealerHistory");
const { sendEmail } = require("../utils/email/transporter");
const transactionHistory = require("../models/transactionHistory");
const uuid = require("uuid");
const client = new postmark.ServerClient(process.env.POSTMARK);

class SubDealerService {
  async createSubdealer({ business, fullName, email, username, phoneNumber }) {
    const tempPassword = await this.generateTemporaryPassword();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(tempPassword, salt);

    let access_token;
    let isUnique = false;

    // Generate a unique access_token
    while (!isUnique) {
      access_token = uuid.v4();

      // Check if the generated access_token is unique in the database
      const existingAccount = await Account.findOne({ access_token });

      if (!existingAccount) {
        isUnique = true;
      }
    }

    const subdealer = new Account({
      name: fullName,
      email,
      username,
      dealer: business,
      mobile_number: phoneNumber,
      password,
      type: "subdealer",
      access_token, // Set the access_token here
    });
    await subdealer.save();

    const Subject = "Welcome to the Wisper Dealer Network!";
    const TextBody =
      `Dear ${subdealer.fullName},\n\n` +
      `Welcome to the Wisper Dealer Network! We're thrilled to have you on board as a sub-dealer with [Your Company Name]. Your account is now ready, and you can start accessing our platform right away.\n\n` +
      `Here are your login details:\n\n` +
      `Username: ${subdealer.username}\n` +
      `Email: ${subdealer.email}\n` +
      `Password: ${tempPassword}\n\n` +
      `Please Note: We recommend changing your password after your first login for security reasons.`;

    await sendEmail(subdealer.email, Subject, TextBody);

    return subdealer;
  }

  async generateTemporaryPassword() {
    const length = 10;
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let tempPassword = "";
    for (let i = 0; i < length; i++) {
      tempPassword += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return tempPassword;
  }

  // Helper function to send a welcome email
  async sendWelcomeEmail(subdealer) {
    console.log(subdealer.email);
    await client.sendEmail({
      From: "admin@wisper.ng",
      To: subdealer.email,
      Subject: "Welcome to the Wisper Dealer Network!",
      TextBody:
        `Dear ${subdealer.fullName},\n\n` +
        `Welcome to the Wisper Dealer Network! We're thrilled to have you on board as a sub-dealer with [Your Company Name]. Your account is now ready, and you can start accessing our platform right away.\n\n` +
        `Here are your login details:\n\n` +
        `Username: ${subdealer.username}\n` +
        `Email: ${subdealer.email}\n` +
        `Password: ${subdealer.password}\n\n` +
        `Please Note: We recommend changing your password after your first login for security reasons.`,
    });

    console.log("Email Sent");
  }

  async getSubdealersByBusiness(businessId) {
    try {
      // Implement logic to fetch subdealers related to the provided businessId from the database
      const subdealers = await Account.find({ dealer: businessId }).sort({
        createdAt: -1,
      });
      return subdealers;
    } catch (error) {
      throw new Error("Failed to fetch subdealers");
    }
  }

  async getSubdealersByTrx(businessId) {
    try {
      // Implement logic to fetch subdealers related to the provided businessId from the database
      const subdealers = await Account.find({ dealer: businessId }).sort({
        createdAt: -1,
      });

      // Create an array to store the transactions
      const transactions = [];

      // Loop through each subdealer and find transactions that match the business_id
      for (const subdealer of subdealers) {
        const subdealerId = subdealer._id;

        // Find transactions that match the business_id and subdealer's _id
        const subdealerTransactions = await transactionHistory.find({
          business_id: businessId,
          admin_ref: subdealerId, // Assuming admin_ref corresponds to subdealer._id
        });

        // Add the found transactions to the transactions array
        transactions.push(...subdealerTransactions);
      }

      return transactions;
    } catch (error) {
      throw new Error("Failed to fetch subdealers");
    }
  }

  async getSubdealersAdmin() {
    try {
      const subdealers = await Account.find({ type: "subdealer" }).sort({
        createdAt: -1,
      });
      return subdealers;
    } catch (error) {
      throw new Error("Failed to fetch subdealers");
    }
  }

  async purchaseSubdealerMegaData(dealer, business_id, network, amountInGB) {
    try {
      const userBalance = await dataBalance.findOne({ business: dealer });
      if (!userBalance) {
        throw new Error("User data balance not found");
      }

      const dealerBalance = await dataBalance.findOne({
        business: business_id,
      });

      if (!dealerBalance) {
        throw new Error("User data balance not found");
      }

      const ownerMegaWallet = { ...userBalance.mega_wallet };

      const owner_old = ownerMegaWallet[network];

      if (Number(owner_old) < Number(amountInGB * 1000)) {
        throw new Error("Not enough balance");
      }

      const subdealerMegaWallet = { ...dealerBalance.mega_wallet };
      const subdealer_old = subdealerMegaWallet[network];

      ownerMegaWallet[network] -= Number(amountInGB) * 1000;
      subdealerMegaWallet[network] += Number(amountInGB) * 1000;

      const updatedOwnerBalance = await dataBalance.findOneAndUpdate(
        { business: dealer },
        {
          mega_wallet: ownerMegaWallet,
          last_purchase: new Date(),
        },
        { new: true }
      );

      const updatedSubDealerBalance = await dataBalance.findOneAndUpdate(
        { business: business_id },
        {
          mega_wallet: subdealerMegaWallet,
          last_purchase: new Date(),
        },
        { new: true }
      );

      const deaAcct = await Account.findOne({ _id: dealer });
      const subAcct = await Account.findOne({ _id: business_id });

      const ownerPurchase = new megaPurchaseHistory({
        business_id: dealer,
        username: deaAcct.username,
        amount: 0,
        channel: "Wallet",
        volume: amountInGB * -1,
        old_bal: owner_old,
        new_bal: ownerMegaWallet[network],
        network: network,
        status: "success",
      });

      const subdealerPurchase = new subdealerHistory({
        business_id: business_id,
        username: subAcct.username,
        dealer: dealer,
        amount: 0,
        volume: amountInGB,
        channel: "Dealer",
        old_bal: subdealer_old,
        new_bal: subdealerMegaWallet[network],
        network: network,
        status: "success",
      });

      await ownerPurchase.save();
      await subdealerPurchase.save();

      return updatedSubDealerBalance;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SubDealerService();
