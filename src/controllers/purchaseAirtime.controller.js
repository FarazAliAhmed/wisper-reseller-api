/* eslint-disable no-unused-vars */
const { Account } = require("../models/account");
const { verifyFlutterWaveTransaction } = require("../utils/sFHelper");

const {
  AirtimePurchaseService,
} = require("../services/airtimePurchase.service");
const trxHelper = require("../utils/trx.helper");
const addAirtimeTransaction = trxHelper.addAirtimeTransaction;
const revertTransactionStatus = trxHelper.revertTransactionStatus;

const Flutterwave = require("flutterwave-node-v3");

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

const purchaseAirtime = async (req, res) => {
  const { business_id, network, phone_number, price, email, name, trx_ref } =
    req.body;

  // defining price
  const volume = price;

  let businessIdentity;
  let isStoreFront = true;

  if (req.user) {
    // console.log("No business_id");

    const { _id: buss } = req.user;

    isStoreFront = false;

    businessIdentity = buss.toString();
  } else {
    businessIdentity = business_id;
  }

  // console.log({ businessIdentity });

  const reference = generateTransactionId();

  const map_network = { mtn: 1, glo: 2, airtel: 3, "9mobile": 6 };

  // console.log(map_network[network]);

  let savedTransaction = null;

  try {
    if (!req.user) {
      const verfiyFlw = await verifyFlutterWaveTransaction(trx_ref, price);

      if (verfiyFlw.error) {
        throw new Error(verfiyFlw.message);
      }
    }

    savedTransaction = await addAirtimeTransaction(
      reference,
      businessIdentity,
      volume,
      price,
      network,
      phone_number,
      isStoreFront,
      email,
      name
    );
  } catch (error) {
    return res.status(500).json({
      error: true,
      status: "failed",
      message: "Error adding transaction",
    });
  }

  let chargedPrice = null;

  if (req.user.type == "lite") {
    chargedPrice = Number(price) * 0.985;
  } else {
    chargedPrice = Number(price) * 0.98;
  }

  try {
    if (!savedTransaction) {
      return res.status(500).json({
        error: true,
        status: "failed",
        message: "No saved transaction",
      });
    }
    const response = await AirtimePurchaseService.topupAirtime(
      map_network[network],
      phone_number,
      "VTU",
      Number(volume),
      reference
    );

    // const userData = await Account.findById(businessIdentity);

    // Check if there was an error
    if (response.error) {
      if (!req.user) {
        await flw.Transaction.refund({
          id: trx_ref,
          amount: price,
          // comments: "Refund from wisper",
        });
      }

      // revert transaction
      await revertTransactionStatus(
        savedTransaction._id,
        Number(chargedPrice),
        isStoreFront,
        email,
        name
      );
      return res
        .status(500)
        .json({ status: "failed", error: true, message: response.message });
    } else {
      return res.json({
        ...{
          network_provider: network,
          volume: price,
          status: "success",
          transaction_ref: savedTransaction._id,
          created_at: savedTransaction.createdAt,
          business_id: businessIdentity,
        },
        gateway_response: response.message,
        error: false,
        message: "Transaction Successful!",
        data: response.data,
      });
    }
  } catch (error) {
    console.log("error eoccredd again");
    if (!req.user) {
      await flw.Transaction.refund({
        id: trx_ref,
        amount: price,
        // comments: "Refund from wisper",
      });
    }
    // revert transaction
    await revertTransactionStatus(
      savedTransaction._id,
      Number(chargedPrice),
      isStoreFront,
      email,
      name
    );
    //
    console.error("Error:", error);
    return res.status(500).json({
      status: "failed",
      error: true,
      message: "An error occurred during the airtime purchase.",
    });
  }
};

function generateTransactionId() {
  const lagosTimezone = "Africa/Lagos";

  const currentDateTime = new Date().toLocaleString("en-US", {
    timeZone: lagosTimezone,
  });

  const formattedDateTime = currentDateTime.replace(/\/|,|\s|:|PM|AM/g, "");

  const alphanumericString = generateRandomString(4);

  const requestId = formattedDateTime + alphanumericString;

  return requestId;
}

function generateRandomString(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset.charAt(randomIndex);
  }

  return result;
}

module.exports = {
  purchaseAirtime,
};
