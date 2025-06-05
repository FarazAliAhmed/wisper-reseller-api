const Joi = require("joi");
const axios = require("axios");
const monnifyService = require("../services/monnify.service");
const { Account } = require("../models/account");
const monnifyHistory = require("../models/monnifyHistory");

class MonnifyController {
  async addBalance(req, res) {
    try {
      console.log("Add balance", req.body);

      const updatedBalance = await monnifyService.addBalanceByBusinessId(
        req.body
      );

      return res.json(updatedBalance);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  }

  async addBalanceAdmin(req, res) {
    try {
      console.log("Add balance", req.body);

      const { error, value } = addBalanceSchema.validate(req.body);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const updatedBalance = await monnifyService.addBalanceByBusinessIdAdmin(
        req.body
      );

      return res.json(updatedBalance);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  }

  async debitBalanceAdmin(req, res) {
    try {
      console.log("Add balance", req.body);

      const { error, value } = addBalanceSchema.validate(req.body);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const updatedBalance = await monnifyService.debitBalanceByBusinessIdAdmin(
        req.body
      );

      return res.json(updatedBalance);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  }

  async getAccountDetails(req, res) {
    try {
      const { error, value } = getAccountSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const accessToken = await monnifyService.generateAccessToken();

      // console.log({ accessToken });

      await axios
        .get(
          `${process.env.MONNIFY_BASE_URL}/v2/bank-transfer/reserved-accounts/${value.accountReference}`,
          {
            headers: {
              Authorization: `Bearer  ${accessToken}`,
              "Content-Type": "application/json", // Add this line
            },
          }
        )
        .then((response) => {
          res.json(response.data);
          return;
        })
        .catch((err) => {
          // console.log(err);
          res.status(500).json({ message: err.response.data.responseMessage });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }

  async getAllTransaction(req, res) {
    const business_id = req.params.id;
    const { limit } = req.query;

    const limitValue = parseInt(limit) || 1;

    const resp = await monnifyService.getAll(business_id, limitValue);
    if (resp.transactions) return res.status(200).json(resp.transactions);
    return res.status(resp.status).json(resp);
  }

  async getAllMonnify(req, res) {
    try {
      const { limit, page } = req.query;

      const limitValue = parseInt(limit) || 1;
      const toSkip = limitValue * Number(page);

      const resp = await monnifyHistory
        .find()
        .limit(limitValue)
        .skip(toSkip)
        .sort({ createdAt: -1 });

      return res.status(200).json(resp);
    } catch (error) {
      return res.status(500).json({ message: "No monnify History" });
    }
  }

  async createAccount(req, res) {
    try {
      const { error, value } = createSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      // console.log({ accessToken });

      const createdMonnify = await monnifyService.createAccount(
        value.accountReference,
        value.accountName,
        value.customerEmail,
        value.customerName
      );

      res.json(createdMonnify);
    } catch (error) {
      // console.log(error);
      res.status(500).json({ message: "An error occured" });
    }
  }

  async createAllMonifyAccount(req, res) {
    try {
      const users = await Account.find({}); // Fetch all users from the database

      console.log({ users });

      for (const user of users) {
        try {
          // Call the Monnify service to create the account
          await monnifyService.createAccount(
            user._id,
            user.name,
            user.email,
            user.name
          );

          console.log(`Monnify account created for user ${user.name}`);
        } catch (error) {
          console.error(
            `Error creating Monnify account for user ${user.name}:`,
            error.message
          );
          // You can add additional error handling here if needed
        }
      }

      res.json({ message: "Monnify accounts creation completed" });
    } catch (error) {
      console.error("Error creating Monnify accounts:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async deleteAccount(req, res) {
    try {
      const { error, value } = getAccountSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const accessToken = await monnifyService.generateAccessToken();

      // console.log({ accessToken });

      await axios
        .delete(
          `${process.env.MONNIFY_BASE_URL}/v1/bank-transfer/reserved-accounts/reference/${value.accountReference}`,
          {
            headers: {
              Authorization: `Bearer  ${accessToken}`,
              "Content-Type": "application/json", // Add this line
            },
          }
        )
        .then((response) => {
          res.json(response.data);
          return;
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: err.response.data.responseMessage });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "An error occured" });
    }
  }

  async deleteAllAccount(req, res) {
    try {
      const accessToken = await monnifyService.generateAccessToken();

      const users = await Account.find({}); // Fetch all users from the database

      for (const user of users) {
        try {
          await axios.delete(
            `${process.env.MONNIFY_BASE_URL}/v1/bank-transfer/reserved-accounts/reference/${user._id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Only if the deletion is successful, remove the bankAccounts and save the user
          user.bankAccounts = [];
          await user.save();
          console.log(`Deleted Monnify account for ${user.name}`);
        } catch (err) {
          // console.log(err);
          console.error(
            `Failed to delete Monnify account for ${user.name}: ${err.message}`
          );
        }
      }
      res.json({ message: "All Monnify Accounts deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    }
  }
}

module.exports = new MonnifyController();

const getAccountSchema = Joi.object({
  accountReference: Joi.string().required(),
});

const addBalanceSchema = Joi.object({
  business_id: Joi.string().required(),
  amount: Joi.number().min(0).required(),
});

const createSchema = Joi.object({
  accountReference: Joi.string().required(),
  accountName: Joi.string().required(),
  customerEmail: Joi.string().required(),
  customerName: Joi.string().required(),
});
