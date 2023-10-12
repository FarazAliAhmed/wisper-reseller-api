const dataBalance = require("../models/dataBalance");
const megaPurchaseHistory = require("../models/megaPurchaseHistory");

const Flutterwave = require("flutterwave-node-v3");
const storeFrontHistory = require("../models/storeFrontHistory");
const storeFront = require("../models/storeFront");
const userPlan = require("../models/userPlan");

async function verifyFlutterWaveTransaction(transactionId, expectedAmount) {
  const flw = new Flutterwave(
    process.env.FLW_PUBLIC_KEY,
    process.env.FLW_SECRET_KEY
  );

  return flw.Transaction.verify({ id: transactionId })
    .then((response) => {
      // console.log("flw response", response);
      if (
        response.data.status === "successful" &&
        response.data.amount === expectedAmount &&
        response.data.currency === "NGN"
      ) {
        // Success! Confirm the customer's payment
        // console.log("flutterwave", response.data);
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
  trx_ref,
  store_type,
  plan_id
) {
  try {
    const balance = await dataBalance.findOne({ business: businessId });

    if (store_type == "mega") {
      console.log("MEGAAAA");

      // Find the balance document for the specified business
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

      const sFHist = new storeFrontHistory({
        name: custName,
        email: custEmail,
        storeBusiness: businessId,
        phone: phone_number,
        price: price,
        volume: dataVolume,
        profit: `${price}`,
        status: "success",
        network: network,
        transaction_ref: trx_ref,
      });

      await sFHist.save();

      await purchase.save();

      const storeOwner = await storeFront.findOne({ business_id: businessId });

      storeOwner.wallet += parseInt(price).toFixed(2);

      await storeOwner.save();
    } else {
      console.log("LITEEEEEE");
      const storeOwner = await storeFront.findOne({ business_id: businessId });
      const storePlan = await userPlan.findOne({
        business: businessId,
        plan_id: plan_id,
      });

      const resolvedBal = storePlan.selling_price - storePlan.price;

      console.log({ resolvedBal });

      storeOwner.wallet += resolvedBal;

      await storeOwner.save();

      const sFHist = new storeFrontHistory({
        name: custName,
        email: custEmail,
        storeBusiness: businessId,
        phone: phone_number,
        price: price,
        volume: dataVolume,
        profit: `${resolvedBal}`,
        status: "success",
        network: network,
        transaction_ref: trx_ref,
      });

      await sFHist.save();
    }

    // Return the updated balance in the specified format
    return {
      error: false,
      status: 201,
      balance: balance.balance,
      debited: Number(dataVolume),
    };
  } catch (error) {
    console.log(error.message);
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
  price,
  store_type,
  custName,
  custEmail,
  trx_ref
) {
  try {
    if (store_type == "mega") {
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
        status: "failed",
      });

      await purchase.save();
    } else {
      const storeOwner = await storeFront.findOne({ business_id: businessId });
      const storePlan = await userPlan.findOne({
        business: businessId,
        plan_id: plan_id,
      });

      const resolvedBal = storePlan.selling_price - storePlan.price;

      storeOwner.wallet -= resolvedBal;

      await storeOwner.save();
    }

    const sFHist = new storeFrontHistory({
      name: custName,
      email: custEmail,
      storeBusiness: businessId,
      phone: phone_number,
      price: price,
      volume: dataVolume,
      status: "failed",
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

module.exports = {
  debitStoreFrontMegaWallet,
  revertStoreFrontMegaWallet,
  verifyFlutterWaveTransaction,
};
