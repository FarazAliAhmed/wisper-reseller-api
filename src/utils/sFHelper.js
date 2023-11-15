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

      // const newMonnifyHistory = new monnifyHistory({
      //   business_name: custName,
      //   business_id: businessId,
      //   amount: price,
      //   resolvedAmount: price,
      //   new_bal: balance.wallet_balance,
      //   old_bal: old_bal,
      //   purpose: "Data Purchase",
      //   desc: `Data purchase of ${addData.amount} NGN made by ${custName}.`,
      //   pay_type: "debit",
      //   date_of_payment: new Date(),
      //   payment_ref: "AD-trx-" + trx_ref,
      // });

      // await newMonnifyHistory.save();

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

      // const newMonnifyHistory = new monnifyHistory({
      //   business_name: custName,
      //   business_id: businessId,
      //   amount: price,
      //   resolvedAmount: resolvedBal,
      //   new_bal: balance.wallet_balance,
      //   old_bal: old_bal,
      //   purpose: "Data Purchase",
      //   desc: `Data purchase of ${addData.amount} NGN made by ${custName}.`,
      //   pay_type: "debit",
      //   date_of_payment: new Date(),
      //   payment_ref: "AD-trx-" + trx_ref,
      // });

      // await newMonnifyHistory.save();
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

    // const newMonnifyHistory = new monnifyHistory({
    //   business_name: custName,
    //   business_id: businessId,
    //   amount: price,
    //   resolvedAmount: price,
    //   new_bal: balance.wallet_balance,
    //   old_bal: oldUser_bal,
    //   purpose: "Data Purchase",
    //   desc: `Refund ${addData.amount} NGN made by ${custName}.`,
    //   pay_type: "credit",
    //   date_of_payment: new Date(),
    //   payment_ref: "AD-trx-" + trx_ref,
    // });

    // await newMonnifyHistory.save();

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

const toMapPlans = [
  // glo
  { plan_id: 701, price: 50, volume: 200, unit: "mb", network: "glo" },
  { plan_id: 702, price: 115, volume: 500, unit: "mb", network: "glo" },
  { plan_id: 703, price: 230, volume: 1, unit: "gb", network: "glo" },
  { plan_id: 704, price: 460, volume: 2, unit: "gb", network: "glo" },
  { plan_id: 705, price: 690, volume: 3, unit: "gb", network: "glo" },
  { plan_id: 706, price: 1150, volume: 5, unit: "gb", network: "glo" },
  { plan_id: 707, price: 2300, volume: 10, unit: "gb", network: "glo" },

  // mtn
  { plan_id: 210, price: 117.5, volume: 500, unit: "mb", network: "mtn" },
  { plan_id: 52, price: 235, volume: 1, unit: "gb", network: "mtn" },
  { plan_id: 51, price: 470, volume: 2, unit: "gb", network: "mtn" },
  { plan_id: 43, price: 705, volume: 3, unit: "gb", network: "mtn" },
  { plan_id: 50, price: 1175, volume: 5, unit: "gb", network: "mtn" },
  { plan_id: 206, price: 2350, volume: 10, unit: "gb", network: "mtn" },

  // airtel
  {
    plan_id: 257,
    price: 25,
    volume: 100,
    unit: "mb",
    network: "airtel",
  },
  {
    plan_id: 258,
    price: 70,
    volume: 300,
    unit: "mb",
    network: "airtel",
  },
  {
    plan_id: 253,
    price: 115,
    volume: 500,
    unit: "mb",
    network: "airtel",
  },
  { plan_id: 254, price: 225, volume: 1, unit: "gb", network: "airtel" },
  { plan_id: 255, price: 450, volume: 2, unit: "gb", network: "airtel" },
  { plan_id: 256, price: 1125, volume: 5, unit: "gb", network: "airtel" },
  { plan_id: 261, price: 2250, volume: 10, unit: "gb", network: "airtel" },
  { plan_id: 320, price: 3375, volume: 15, unit: "gb", network: "airtel" },
  { plan_id: 262, price: 4500, volume: 20, unit: "gb", network: "airtel" },

  // 9mobile
  { plan_id: 431, price: 5, volume: 25, unit: "mb", network: "9mobile" },
  { plan_id: 411, price: 20, volume: 100, unit: "mb", network: "9mobile" },
  { plan_id: 413, price: 80, volume: 500, unit: "mb", network: "9mobile" },
  { plan_id: 414, price: 160, volume: 1, unit: "gb", network: "9mobile" },
  { plan_id: 421, price: 240, volume: 1.5, unit: "gb", network: "9mobile" },
  { plan_id: 415, price: 320, volume: 2, unit: "gb", network: "9mobile" },
  { plan_id: 420, price: 480, volume: 3, unit: "gb", network: "9mobile" },
  { plan_id: 422, price: 640, volume: 4, unit: "gb", network: "9mobile" },
  { plan_id: 424, price: 720, volume: 4.5, unit: "gb", network: "9mobile" },
  { plan_id: 416, price: 800, volume: 5, unit: "gb", network: "9mobile" },
  { plan_id: 417, price: 1600, volume: 10, unit: "gb", network: "9mobile" },
  { plan_id: 423, price: 1760, volume: 11, unit: "gb", network: "9mobile" },
  { plan_id: 429, price: 8000, volume: 50, unit: "gb", network: "9mobile" },
  {
    plan_id: 430,
    price: 16000,
    volume: 100,
    unit: "gb",
    network: "9mobile",
  },
];

module.exports = {
  debitStoreFrontMegaWallet,
  revertStoreFrontMegaWallet,
  verifyFlutterWaveTransaction,
  calStoreFrontTax,
  toMapPlans,
};
