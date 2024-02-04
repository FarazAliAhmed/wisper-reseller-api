const { Joi } = require("celebrate");
const { Account } = require("../models/account");
const dataBalance = require("../models/dataBalance");
const megaPrice = require("../models/megaPrice");
const helperService = require("../services/helperService");

class HelperController {
  async verifyAllUsersEmail(req, res) {
    try {
      const users = await Account.find();

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        await Account.findOneAndUpdate(
          { _id: user._id },
          { confirmed: true },
          { new: true }
        );
        console.log(user.username, "confirmed");
      }

      // console.log(users);

      return res.json("user successfully updated");
    } catch (error) {
      console.error(error); // Use console.error instead of console.log for errors
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  async changeSubdealerToAgents(req, res) {
    try {
      const users = await Account.find({
        type: "agent",
      });

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        await Account.findOneAndUpdate(
          { _id: user._id },
          { type: "agent" },
          { new: true }
        );
      }

      // console.log(users);

      return res.json("user successfully updated");
    } catch (error) {
      console.error(error); // Use console.error instead of console.log for errors
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  async updateDefaultMegaPrice(req, res) {
    try {
      // Validate the request body
      const { error, value: updateData } = updateMegaPriceSchema.validate(
        req.body
      );

      await megaPrice.findOneAndUpdate({}, updateData, {
        new: true,
      });

      // console.log(users);

      return res.json("megaprice successfully updated");
    } catch (error) {
      console.error(error); // Use console.error instead of console.log for errors
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  // Function to filter and leave one document with positive balance for all accounts

  async filterAndLeaveOneBalanceForAllAccounts(req, res) {
    try {
      // Find all accounts
      const accounts = await Account.find();

      // Iterate through all accounts
      for (const account of accounts) {
        const businessId = account._id;

        // Find all documents for the specified business ID
        const balances = await dataBalance.find({ business: businessId });

        // Find the first document with positive balance
        const balanceWithPositive =
          balances.find(
            (balance) =>
              balance.wallet_balance > 0 ||
              Object.values(balance.mega_wallet).some((value) => value > 0)
          ) || null;

        // Delete all documents except the one with positive balance
        if (balanceWithPositive) {
          await dataBalance.deleteMany({
            business: businessId,
            _id: { $ne: balanceWithPositive._id },
          });
        }

        console.log(`Balances filtered for business ID: ${businessId}`);
      }

      return res.json({ message: "Operation completed for all accounts" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: `Error filtering and leaving one balance with positive balance for all accounts`,
      });
    }
  }

  async filterAndLeaveOneZeroAcount(req, res) {
    try {
      // Find all accounts
      const accounts = await Account.find();

      // Iterate through all accounts
      for (const account of accounts) {
        const businessId = account._id;

        // Find all documents for the specified business ID with wallet_balance and mega_wallet equal to 0
        const zeroBalanceDocuments = await dataBalance.find({
          business: businessId,
          wallet_balance: 0,
          "mega_wallet.mtn_sme": 0,
          "mega_wallet.mtn_gifting": 0,
          "mega_wallet.airtel": 0,
          "mega_wallet.glo": 0,
          "mega_wallet.9mobile": 0,
        });

        // Delete all duplicates except one if both wallet_balance and mega_wallet are 0
        if (zeroBalanceDocuments.length > 1) {
          await dataBalance.deleteMany({
            business: businessId,
            wallet_balance: 0,
            "mega_wallet.mtn_sme": 0,
            "mega_wallet.mtn_gifting": 0,
            "mega_wallet.airtel": 0,
            "mega_wallet.glo": 0,
            "mega_wallet.9mobile": 0,
            _id: { $nin: [zeroBalanceDocuments[0]._id] },
          });
        }

        console.log(`Balances filtered for business ID: ${businessId}`);
      }

      return res.json({ message: "Operation completed for all accounts" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: `Error filtering and leaving one balance with positive balance for all accounts`,
      });
    }
  }

  async calculateTotalVolume(req, res, next) {
    const { error, value } = totalVolumeSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { startDate, endDate, type } = value;

    try {
      const result = await helperService.calculateTotalVolume(
        startDate,
        endDate,
        type
      );

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HelperController();

const updateMegaPriceSchema = Joi.object({
  // mtn_sme: Joi.number().min(0).optional(),
  // mtn_gifting: Joi.number().min(0).optional(),
  mtn: Joi.number().min(0).optional(),
  airtel: Joi.number().min(0).optional(),
  glo: Joi.number().min(0).optional(),
  "9mobile": Joi.number().min(0).optional(),
});

const totalVolumeSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  type: Joi.string().valid("failed", "success").required(),
});
