const { Account } = require("../models/account");

const {
  AirtimePurchaseService,
} = require("../services/airtimePurchase.service");
const trxHelper = require("../utils/trx.helper");
const addAirtimeTransaction = trxHelper.addAirtimeTransaction;
const revertTransactionStatus = trxHelper.revertTransactionStatus;

const purchaseAirtime = async (req, res) => {
  const { business_id, network, phone_number, volume, price, email, name } =
    req.body;

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

  const map_network = { mtn: 1, glo: 3, airtel: 2, "9mobile": 4 };

  // console.log(map_network[network]);

  let savedTransaction = null;

  try {
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
    return res.status(500).json({ message: "Error adding transaction" });
  }

  try {
    if (!savedTransaction) {
      return res.status(500).json({ message: "No saved transaction" });
    }
    const response = await AirtimePurchaseService.topupAirtime(
      map_network[network],
      phone_number,
      "VTU",
      Number(volume),
      reference
    );

    const userData = await Account.findById(businessIdentity);

    // Check if there was an error
    if (response.error) {
      // revert transaction
      await revertTransactionStatus(
        savedTransaction._id,
        Number(price),
        email,
        name
      );
      return res
        .status(response.status)
        .json({ error: true, message: response.message });
    } else {
      return res.status(response.status).json({
        error: false,
        message: response.message,
        data: response.data,
        user: userData,
      });
    }
  } catch (error) {
    // revert transaction
    await revertTransactionStatus(
      savedTransaction._id,
      Number(price),
      email,
      name
    );

    console.error("Error:", error);
    return res.status(500).json({
      error: true,
      message: "An error occurred during the airtime purchase.",
    });
  }
};

function generateTransactionId() {
  const timestamp = Date.now(); // Get the current timestamp in milliseconds
  const random = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999
  const trxId = `Airtime_${timestamp}${random}`; // Concatenate timestamp and random number
  return trxId;
}

module.exports = {
  purchaseAirtime,
};
