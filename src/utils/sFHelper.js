const dataBalance = require("../models/dataBalance");
const megaPurchaseHistory = require("../models/megaPurchaseHistory");

const Flutterwave = require("flutterwave-node-v3");
const storeFrontHistory = require("../models/storeFrontHistory");
const storeFront = require("../models/storeFront");
const userPlan = require("../models/userPlan");
const monnifyHistory = require("../models/monnifyHistory");

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

    const old_bal = balance.wallet_balance;

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

      console.log({ oldUser_bal, networkBalance, volume: Number(dataVolume) });

      // Deduct the data volume from the mega wallet
      balance.mega_wallet[network] -= Number(dataVolume);

      console.log(balance);

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

      const newMonnifyHistory = new monnifyHistory({
        business_name: custName,
        business_id: businessId,
        amount: price,
        resolvedAmount: price,
        new_bal: balance.wallet_balance,
        old_bal: old_bal,
        purpose: "Data Purchase",
        desc: `Data purchase of ${addData.amount} NGN made by ${custName}.`,
        pay_type: "debit",
        date_of_payment: new Date(),
        payment_ref: "AD-trx-" + trx_ref,
      });

      await newMonnifyHistory.save();

      const storeOwner = await storeFront.findOne({ business_id: businessId });

      const newWal = Number(storeOwner.wallet) + Number(price);

      storeOwner.wallet = newWal.toFixed(2);

      await storeOwner.save();
    } else {
      console.log("LITEEEEEE");
      const storeOwner = await storeFront.findOne({ business_id: businessId });
      const storePlan = await userPlan.findOne({
        business: businessId,
        plan_id: plan_id,
      });

      // console.log({ storeOwner, storePlan });

      // console.log({ plan_id, businessId });

      const resolvedBal =
        Number(storePlan.selling_price) - Number(storePlan.price);

      const newWal = Number(storeOwner.wallet) + resolvedBal;

      // console.log({ resolvedBal, newWal });

      storeOwner.wallet = newWal.toFixed(2);

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

      const newMonnifyHistory = new monnifyHistory({
        business_name: custName,
        business_id: businessId,
        amount: price,
        resolvedAmount: resolvedBal,
        new_bal: balance.wallet_balance,
        old_bal: old_bal,
        purpose: "Data Purchase",
        desc: `Data purchase of ${addData.amount} NGN made by ${custName}.`,
        pay_type: "debit",
        date_of_payment: new Date(),
        payment_ref: "AD-trx-" + trx_ref,
      });

      await newMonnifyHistory.save();
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
    const balance = await dataBalance.findOne({ business: businessId });
    const oldUser_bal = balance.mega_wallet[network];

    if (store_type == "mega") {
      // Find the balance document for the specified business

      if (!balance) {
        return {
          error: true,
          status: 404,
          message: "Balance not found for the business",
        };
      }

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
        status: "failed",
      });

      await purchase.save();

      const storeOwner = await storeFront.findOne({ business_id: businessId });

      const newWal = Number(storeOwner.wallet) - Number(price);

      storeOwner.wallet = newWal.toFixed(2);

      await storeOwner.save();
    } else {
      const storeOwner = await storeFront.findOne({ business_id: businessId });
      const storePlan = await userPlan.findOne({
        business: businessId,
        plan_id: plan_id,
      });

      const resolvedBal =
        Number(storePlan.selling_price) - Number(storePlan.price);

      const newWal = Number(storeOwner.wallet) - resolvedBal;

      storeOwner.wallet = newWal.toFixed(2);

      await storeOwner.save();
    }

    const sFHist = new storeFrontHistory({
      name: custName,
      email: custEmail,
      storeBusiness: businessId,
      phone: phone_number,
      profit: 0,
      price: price,
      volume: dataVolume,
      status: "failed",
      network: network,
      transaction_ref: trx_ref,
    });

    await sFHist.save();

    const newMonnifyHistory = new monnifyHistory({
      business_name: custName,
      business_id: businessId,
      amount: price,
      resolvedAmount: price,
      new_bal: balance.wallet_balance,
      old_bal: oldUser_bal,
      purpose: "Data Purchase",
      desc: `Refund ${addData.amount} NGN made by ${custName}.`,
      pay_type: "credit",
      date_of_payment: new Date(),
      payment_ref: "AD-trx-" + trx_ref,
    });

    await newMonnifyHistory.save();

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

async function calStoreFrontTax(amount) {
  let tax = 0;

  if (Number(amount) <= 5000) {
    tax = 10;
  } else if (Number(amount) > 5000 && Number(amount) <= 50000) {
    tax = 25;
  } else if (Number(amount) > 50000) {
    tax = 50;
  }

  const taxedAmount = Number(amount) - tax;
  return { taxedAmount, tax };
}

module.exports = {
  debitStoreFrontMegaWallet,
  revertStoreFrontMegaWallet,
  verifyFlutterWaveTransaction,
  calStoreFrontTax,
};
