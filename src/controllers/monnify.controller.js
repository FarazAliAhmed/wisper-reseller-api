const Joi = require("joi");
const axios = require("axios");
const monnifyService = require("../services/monnify.service");

class MonnifyController {
  async addBalance(req, res) {
    try {
      console.log("Add balance", req.body);
      // Validate the request body
      // const { error, value: addData } = addBalanceSchema.validate(req.body);
      // if (error) {
      //   return res.status(400).json({ message: error.details[0].message });
      // }

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

  async createAccount(req, res) {
    try {
      const { error, value } = createSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const accessToken = await monnifyService.generateAccessToken();

      // console.log({ accessToken });

      await axios
        .post(
          `${process.env.MONNIFY_BASE_URL}/v2/bank-transfer/reserved-accounts`,
          {
            accountReference: value.accountReference,
            accountName: value.accountName,
            currencyCode: "NGN",
            contractCode: process.env.MONNIFY_CONTRACT_CODE,
            customerEmail: value.customerEmail,
            bvn: "21212121212",
            customerName: value.customerName,
            getAllAvailableBanks: true,
          },
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
      // console.log(error);
      res.status(500).json({ message: "An error occured" });
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
