const { Account } = require("../models/account");
const dataBalance = require("../models/dataBalance");
const megaPrice = require("../models/megaPrice");

class MegaPriceService {
  async updateOrCreateMegaPrice(updateData) {
    try {
      const user = await Account.findById(updateData.business_id);
      if (!user) {
        throw new Error("No user of this ID");
      }

      console.log({ user });

      if (user.type != "mega") {
        throw new Error("Not a mega user");
      }

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

  async getMegaPrices(business_id) {
    const userMegaPrice = await megaPrice.findOne({ business_id: business_id });
    // console.log({ userMegaPrice });
    if (!userMegaPrice) {
      throw new Error("No mega Price");
    }

    return userMegaPrice;
  }

  async purchaseMegaData(business_id, network, amount) {
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
      if (selectedPrice === undefined) {
        throw new Error("Invalid data plan selected");
      }

      if (userBalance.wallet_balance < amount) {
        throw new Error("Insufficient wallet balance");
      }

      if (userBalance.wallet_balance < selectedPrice) {
        throw new Error("Insufficient wallet balance");
      }
      const newWalletBalance = userBalance.wallet_balance - amount;
      const newMegaWallet = { ...userBalance.mega_wallet };
      newMegaWallet[network] += (amount / selectedPrice).toFixed(1);

      const updatedUserBalance = await dataBalance.findOneAndUpdate(
        { business: business_id },
        {
          wallet_balance: newWalletBalance,
          mega_wallet: newMegaWallet,
          last_purchase: new Date(),
        },
        { new: true }
      );

      return updatedUserBalance;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MegaPriceService();
