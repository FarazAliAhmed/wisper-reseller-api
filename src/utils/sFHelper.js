const dataBalance = require("../models/dataBalance");
const megaPurchaseHistory = require("../models/megaPurchaseHistory");

const Flutterwave = require("flutterwave-node-v3");
const storeFrontHistory = require("../models/storeFrontHistory");

async function verifyFlutterWaveTransaction(transactionId, expectedAmount) {
  const flw = new Flutterwave(
    process.env.FLW_PUBLIC_KEY,
    process.env.FLW_SECRET_KEY
  );

  return flw.Transaction.verify({ id: transactionId })
    .then((response) => {
      if (
        response.data.status === "successful" &&
        response.data.amount === expectedAmount &&
        response.data.currency === expectedCurrency
      ) {
        // Success! Confirm the customer's payment
        console.log("flutterwave", response.data);
        return {
          error: false,
          data: response.data,
        };
      } else {
        return {
          error: true,
          message: "Not Verified",
          data: null,
        };
      }
    })
    .catch((err) => {
      console.log("Flutterwave err", err);
      return {
        error: true,
        message: err.message,
        data: null,
      };
    });
}

async function debitStoreFrontMegaWallet(
  businessId,
  network,
  dataVolume,
  phone_number,
  price,
  custName,
  custEmail,
  trx_ref
) {
  try {
    // Find the balance document for the specified business
    const balance = await dataBalance.findOne({ business: businessId });

    if (!balance) {
      return {
        error: true,
        status: 404,
        message: "Balance not found for the business",
      };
    }

    const oldUser_bal = balance.mega_wallet[network];

    // Check if the mega wallet for the specified network has enough balance
    const networkBalance = balance.mega_wallet[network];
    if (Number(networkBalance) < Number(dataVolume)) {
      return {
        error: true,
        status: 400,
        message: "Insufficient balance in the mega wallet for the network",
      };
    }

    // Deduct the data volume from the mega wallet
    balance.mega_wallet[network] -= Number(dataVolume);

    await balance.save();

    const purchase = new megaPurchaseHistory({
      business_id: businessId,
      username: phone_number,
      amount: price,
      volume: dataVolume,
      channel: "Store Front",
      old_bal: oldUser_bal,
      new_bal: balance.mega_wallet[network],
      network: network,
      status: "success",
    });

    await purchase.save();

    const sFHist = new storeFrontHistory({
      name: custName,
      email: custEmail,
      storeBusiness: businessId,
      phone: phone_number,
      price: price,
      volume: dataVolume,
      status: "success",
      network: network,
      transaction_ref: trx_ref,
    });

    await sFHist.save();

    // Return the updated balance in the specified format
    return {
      error: false,
      status: 201,
      balance: balance.balance,
      debited: Number(dataVolume),
    };
  } catch (error) {
    return {
      error: true,
      status: 500,
      message: error.message,
    };
  }
}

async function revertStoreFrontMegaWallet(
  businessId,
  network,
  dataVolume,
  phone_number,
  price
) {
  try {
    // Find the balance document for the specified business
    const balance = await dataBalance.findOne({ business: businessId });

    if (!balance) {
      return {
        error: true,
        status: 404,
        message: "Balance not found for the business",
      };
    }

    const oldUser_bal = balance.mega_wallet[network];

    // Check if the mega wallet for the specified network has enough balance
    const networkBalance = balance.mega_wallet[network];
    if (Number(networkBalance) < Number(dataVolume)) {
      return {
        error: true,
        status: 400,
        message: "Insufficient balance in the mega wallet for the network",
      };
    }

    // Deduct the data volume from the mega wallet
    balance.mega_wallet[network] += Number(dataVolume);

    await balance.save();

    const purchase = new megaPurchaseHistory({
      business_id: businessId,
      username: phone_number,
      amount: price,
      volume: dataVolume,
      channel: "Store Front",
      old_bal: oldUser_bal,
      new_bal: balance.mega_wallet[network],
      network: network,
      status: "success",
    });

    await purchase.save();

    // Return the updated balance in the specified format
    return {
      error: false,
      status: 201,
      balance: balance.balance,
      debited: Number(dataVolume),
    };
  } catch (error) {
    return {
      error: true,
      status: 500,
      message: error.message,
    };
  }
}

module.exports = {
  debitStoreFrontMegaWallet,
  revertStoreFrontMegaWallet,
  verifyFlutterWaveTransaction,
};
