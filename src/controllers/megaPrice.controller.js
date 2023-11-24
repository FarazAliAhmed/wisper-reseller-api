const Joi = require("joi");
const megaPriceService = require("../services/megaPriceService");
const megaPurchaseHistory = require("../models/megaPurchaseHistory");
const megaPrice = require("../models/megaPrice");
const megaMaintenance = require("../models/megaMaintenance");
const { Account } = require("../models/account");

class MegaPriceController {
  async createDefaultMegaPrice(req, res) {
    try {
      // Validate the request body
      const { error, value: updateData } = updateMegaPriceSchema.validate(
        req.body
      );
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const users = await Account.find({}); // Fetch all users from the database

      for (const user of users) {
        try {
          // Call the Mega Price service to create the account
          updateData.business_id = user._id;

          await megaPriceService.updateOrCreateMegaPrice(updateData);

          console.log(`Mega Price created for user ${user.name}`);
        } catch (error) {
          console.error(
            `Error creating Mega Price for user ${user.name}:`,
            error.message
          );
          // You can add additional error handling here if needed
        }
      }

      res.json({ message: "Mega Prices Created For All Users" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  }
  async updateMegaPrice(req, res) {
    try {
      // Validate the request body
      const { error, value: updateData } = updateMegaPriceSchema.validate(
        req.body
      );
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const updatedMegaPrice = await megaPriceService.updateOrCreateMegaPrice(
        updateData
      );
      if (!updatedMegaPrice) {
        return res.status(404).json({ message: "MegaPrice not found" });
      }
      return res.json(updatedMegaPrice);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  }

  async purchaseMegaData(req, res) {
    try {
      // Validate the request body
      const { error } = purchaseMegaDataSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { business_id, network, amountInGB } = req.body;

      // Check if the network is under maintenance
      const maintenance = await megaMaintenance.findOne({ [network]: true });

      if (maintenance) {
        return res
          .status(403)
          .json({ error: `The ${network} network is under maintenance` });
      }

      const updatedBalance = await megaPriceService.purchaseMegaData(
        business_id,
        network,
        amountInGB
      );
      res.json(updatedBalance);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  async purchaseAdminMegaData(req, res) {
    try {
      // Validate the request body
      const { error } = purchaseMegaDataSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { business_id, network, amountInGB } = req.body;

      // Check if the network is under maintenance
      const maintenance = await megaMaintenance.findOne({ [network]: true });

      if (maintenance) {
        return res
          .status(403)
          .json({ error: `The ${network} network is under maintenance` });
      }

      const updatedBalance = await megaPriceService.purchaseAdminMegaData(
        business_id,
        network,
        amountInGB
      );
      res.json(updatedBalance);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  async debitAdminMegaData(req, res) {
    try {
      // Validate the request body
      const { error } = purchaseMegaDataSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { business_id, network, amountInGB } = req.body;

      // Check if the network is under maintenance
      const maintenance = await megaMaintenance.findOne({ [network]: true });

      if (maintenance) {
        return res
          .status(403)
          .json({ error: `The ${network} network is under maintenance` });
      }

      const updatedBalance = await megaPriceService.debitAdminMegaData(
        business_id,
        network,
        amountInGB
      );
      res.json(updatedBalance);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  async getPurchaseHistoryAdmin(req, res) {
    try {
      const { limit, page } = req.query;

      const limitValue = Number(limit) || 1;
      const toSkip = limitValue * Number(page);

      const purchases = await megaPurchaseHistory
        .find({})
        .sort({ createdAt: -1 })
        .limit(limitValue)
        .skip(toSkip);

      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPurchaseHistory(req, res) {
    try {
      const business_id = req.params.id;
      const { limit, page } = req.query;

      const limitValue = Number(limit) || 1;
      const toSkip = limitValue * Number(page);

      const purchases = await megaPurchaseHistory
        .find({
          business_id: business_id,
        })
        .sort({ createdAt: -1 })
        .limit(limitValue)
        .skip(toSkip);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMegaPriceUser(req, res) {
    try {
      const businessId = req.params.id;
      const megaPriceData = await megaPrice.findOne({
        business_id: businessId,
      });

      if (!megaPriceData) {
        return res.status(404).json({ message: "MegaPrice not found" });
      }

      res.json(megaPriceData);
    } catch (error) {
      console.error("Error fetching MegaPrice:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new MegaPriceController();

const purchaseMegaDataSchema = Joi.object({
  business_id: Joi.string().required(),
  network: Joi.string().min(0).required(),
  amountInGB: Joi.number().min(0).required(),
});

const updateMegaPriceSchema = Joi.object({
  business_id: Joi.string().optional(),
  mtn_sme: Joi.number().min(0).optional(),
  mtn_gifting: Joi.number().min(0).optional(),
  airtel: Joi.number().min(0).optional(),
  glo: Joi.number().min(0).optional(),
  "9mobile": Joi.number().min(0).optional(),
});
