const Joi = require("joi");
const axios = require("axios");
const monnifyService = require("../services/monnify.service");
const { Account } = require("../models/account");

class MonnifyController {
  async addBalance(req, res) {
    try {
      console.log("Add balance", req.body);
      // Validate the request body
      // const { error, value: addData } = addBalanceSchema.validate(req.body);
      // if (error) {
      //   return res.status(400).json({ message: error.details[0].message });
      // }
      //

      const updatedBalance = await monnifyService.addBalanceByBusinessId(
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
    const resp = await monnifyService.getAll(business_id);
    if (resp.transactions) return res.status(200).json(resp.transactions);
    return res.status(resp.status).json(resp);
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

  // Define a route to create Monnify accounts for all users
  async createAllMonifyAccount(req, res) {
    try {
      const users = await Account.find({}); // Fetch all users from the database

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
      res.status(500).json({ message: "An error occurred" });
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

      // console.log({ accessToken });

      const users = await Account.find({}); // Fetch all users from the database

      for (const user of users) {
        await axios
          .delete(
            `${process.env.MONNIFY_BASE_URL}/v1/bank-transfer/reserved-accounts/reference/${user._id}`,
            {
              headers: {
                Authorization: `Bearer  ${accessToken}`,
                "Content-Type": "application/json", // Add this line
              },
            }
          )
          .then(async (response) => {
            user.bankAccounts = [];

            // Save the user document
            await user.save();

            console.log(`deleted monnify account for ${user.name}`);
          })
          .catch(async (err) => {
            user.bankAccounts = [];

            // Save the user document
            await user.save();
            console.log(`failed to delete monnify account for ${user.name}`);
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "An error occured" });
    }
  }
}

module.exports = new MonnifyController();

const getAccountSchema = Joi.object({
  accountReference: Joi.string().required(),
});

const addBalanceSchema = Joi.object({
  business: Joi.string().required(),
  amount: Joi.number().min(0).required(),
});

const createSchema = Joi.object({
  accountReference: Joi.string().required(),
  accountName: Joi.string().required(),
  customerEmail: Joi.string().required(),
  customerName: Joi.string().required(),
});
