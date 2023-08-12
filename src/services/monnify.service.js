const dataBalance = require("../models/dataBalance");

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

      return updatedBalance;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MonnifyService();
