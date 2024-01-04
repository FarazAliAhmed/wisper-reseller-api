/* eslint-disable no-useless-catch */
const { Account } = require("../models/account");
const dataBalance = require("../models/dataBalance");
const megaPrice = require("../models/megaPrice");
const megaPurchaseHistory = require("../models/megaPurchaseHistory");
const monnifyHistory = require("../models/monnifyHistory");
const specialBusiness = require("../models/specialBusiness");

class MegaPriceService {
  async updateOrCreateMegaPrice(updateData) {
    try {
      const user = await Account.findById(updateData.business_id);
      if (!user) {
        throw new Error("No user of this ID");
      }

      // console.log({ user });

      // if (user.type != "mega") {
      //   throw new Error("Not a mega user");
      // }

      const filter = { business_id: updateData.business_id };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      const updatedMegaPrice = await megaPrice.findOneAndUpdate(
        filter,
        updateData,
        options
      );

      return updatedMegaPrice;
    } catch (error) {
      throw error;
    }
  }

  async calculateAmountToPay(selectedPrice, amountInGB) {
    const matchingRange = selectedPrice.find((range) => {
      return amountInGB >= range.rangeStart && amountInGB <= range.rangeEnd;
    });

    return matchingRange ? amountInGB * matchingRange.pricePerGB : null;
  }

  async checkSpecialBusiness(email) {
    try {
      // Fetch all documents from the SpecialBusiness collection
      const specialBusinesses = await specialBusiness.find({}, "email");

      // Extract the emails from the fetched documents
      const emailArray = specialBusinesses.map((doc) => doc.email);

      // console.log(emailArray);

      // Check if the provided email is in the array
      return emailArray.includes(email);
    } catch (error) {
      console.error("Error checking special business:", error);
      return false;
    }
  }

  async getMegaPrices(business_id) {
    const userMegaPrice = await megaPrice.findOne({ business_id: business_id });
    // console.log({ userMegaPrice });
    if (!userMegaPrice) {
      throw new Error("No mega Price");
    }

    return userMegaPrice;
  }

  async purchaseMegaData(business_id, network, amountInGB) {
    try {
      const megaPrices = await this.getMegaPrices(business_id);
      if (!megaPrices) {
        throw new Error("Mega prices not found");
      }

      const userBalance = await dataBalance.findOne({ business: business_id });
      if (!userBalance) {
        throw new Error("User data balance not found");
      }

      const user = await Account.findOne({
        _id: business_id,
      });

      if (!user) {
        throw new Error("User not found");
      }

      let selectedPrice = megaPrices[network];

      console.log({ selectedPrice, network });

      if (!selectedPrice || selectedPrice == 0) {
        throw new Error("Price Not yet set");
      }

      let amountToPay = null;

      if (user.type == "glo_dealer" || user.type == "glo_agent") {
        amountToPay = await this.calculateAmountToPay(
          megaPrices["gloDealer"],
          amountInGB
        );
      } else {
        amountToPay = selectedPrice * amountInGB;
      }

      console.log({ amountToPay });

      if (selectedPrice === undefined) {
        throw new Error("Invalid data plan selected");
      }

      if (userBalance.wallet_balance < amountToPay) {
        throw new Error("Insufficient wallet balance");
      }

      const oldwalletBalance = Number(userBalance.wallet_balance);
      const newWalletBalance =
        Number(userBalance.wallet_balance) - Number(amountToPay);
      const newMegaWallet = { ...userBalance.mega_wallet };

      const oldUser_bal = newMegaWallet[network];

      newMegaWallet[network] += Number(amountInGB) * 1000;

      const updatedUserBalance = await dataBalance.findOneAndUpdate(
        { business: business_id },
        {
          wallet_balance: newWalletBalance,
          mega_wallet: newMegaWallet,
          last_purchase: new Date(),
        },
        { new: true }
      );

      const purchase = new megaPurchaseHistory({
        business_id: business_id,
        username: user.username,
        amount: amountToPay,
        volume: amountInGB,
        channel: "Wallet",
        old_bal: oldUser_bal,
        new_bal: newMegaWallet[network],
        network: network,
        status: "success",
      });

      await purchase.save();

      var currentDate = new Date();
      var epochTime = currentDate.getTime();
      console.log({ epochTime });

      const newMonnifyHistory = new monnifyHistory({
        business_name: user.username,
        business_id: business_id,
        amount: amountToPay,
        new_bal: newWalletBalance,
        old_bal: oldwalletBalance,
        purpose: "data purchase",
        desc: `Payment of ${amountToPay} NGN made for data purchase ${amountInGB}GB of ${network}.`,
        pay_type: "debit",
        date_of_payment: new Date(),
        payment_ref: epochTime,
      });

      await newMonnifyHistory.save();

      return updatedUserBalance;
    } catch (error) {
      throw error;
    }
  }

  async purchaseAdminMegaData(business_id, network, amountInGB) {
    try {
      // console.log("user id", business_id);
      const megaPrices = await this.getMegaPrices(business_id);
      if (!megaPrices) {
        throw new Error("Mega prices not found");
      }

      const userBalance = await dataBalance.findOne({ business: business_id });
      if (!userBalance) {
        throw new Error("User data balance not found");
      }

      const selectedPrice = megaPrices[network];

      if (selectedPrice == 0) {
        throw new Error("Price Not yet set");
      }

      const amountToPay = selectedPrice * amountInGB;
      console.log({ selectedPrice });

      if (selectedPrice === undefined) {
        throw new Error("Invalid data plan selected");
      }

      if (userBalance.wallet_balance < amountToPay) {
        throw new Error("Insufficient wallet balance");
      }

      const oldwalletBalance = Number(userBalance.wallet_balance);
      const newWalletBalance =
        Number(userBalance.wallet_balance) - Number(amountToPay);
      const newMegaWallet = { ...userBalance.mega_wallet };

      const oldUser_bal = newMegaWallet[network];

      newMegaWallet[network] += Number(amountInGB) * 1000;

      const updatedUserBalance = await dataBalance.findOneAndUpdate(
        { business: business_id },
        {
          wallet_balance: newWalletBalance,
          mega_wallet: newMegaWallet,
          last_purchase: new Date(),
        },
        { new: true }
      );

      const user = await Account.findOne({
        _id: business_id,
      });

      const purchase = new megaPurchaseHistory({
        business_id: business_id,
        username: user.username,
        amount: amountToPay,
        volume: amountInGB,
        channel: "Funding - Admin",
        old_bal: oldUser_bal,
        new_bal: newMegaWallet[network],
        network: network,
        status: "success",
      });

      await purchase.save();

      var currentDate = new Date();
      var epochTime = currentDate.getTime();
      console.log({ epochTime });

      const newMonnifyHistory = new monnifyHistory({
        business_name: user.username,
        business_id: business_id,
        amount: amountToPay,
        new_bal: newWalletBalance,
        old_bal: oldwalletBalance,
        purpose: "data purchase",
        desc: `Payment of ${amountToPay} NGN made for data purchase ${amountInGB}GB of ${network}.`,
        pay_type: "debit",
        date_of_payment: new Date(),
        payment_ref: epochTime,
      });

      await newMonnifyHistory.save();

      return updatedUserBalance;
    } catch (error) {
      throw error;
    }
  }

  async debitAdminMegaData(business_id, network, amountInGB) {
    try {
      const userBalance = await dataBalance.findOne({ business: business_id });
      if (!userBalance) {
        throw new Error("User data balance not found");
      }

      const oldwalletBalance = Number(userBalance.wallet_balance);

      const newMegaWallet = { ...userBalance.mega_wallet };

      const oldUser_bal = newMegaWallet[network];

      newMegaWallet[network] -= Number(amountInGB) * 1000;

      const updatedUserBalance = await dataBalance.findOneAndUpdate(
        { business: business_id },
        {
          mega_wallet: newMegaWallet,
          last_purchase: new Date(),
        },
        { new: true }
      );

      const user = await Account.findOne({
        _id: business_id,
      });

      const purchase = new megaPurchaseHistory({
        business_id: business_id,
        username: user.username,
        amount: 0,
        volume: amountInGB,
        channel: "Debit - Admin",
        old_bal: oldUser_bal,
        new_bal: newMegaWallet[network],
        network: network,
        status: "success",
      });

      await purchase.save();

      return updatedUserBalance;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MegaPriceService();
