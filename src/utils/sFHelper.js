const dataBalance = require("../models/dataBalance");
const megaPurchaseHistory = require("../models/megaPurchaseHistory");

const Flutterwave = require("flutterwave-node-v3");
const storeFrontHistory = require("../models/storeFrontHistory");
const storeFront = require("../models/storeFront");
const userPlan = require("../models/userPlan");
const monnifyHistory = require("../models/monnifyHistory");

async function verifyFlutterWaveTransaction(transactionId, expectedAmount) {
  // FLUTTERWAVE COMMENTED OUT - RETURN ERROR FOR NOW
  return {
    error: true,
    message: "Flutterwave verification is temporarily disabled. Please configure FLW_PUBLIC_KEY and FLW_SECRET_KEY.",
  };

  /* UNCOMMENT WHEN FLUTTERWAVE IS CONFIGURED
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
  */
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
  {
    plan_id: 701,
    price: 45,
    volume: 200,
    unit: "mb",
    plan_type: "gifting",
    network: "glo",
  },
  {
    plan_id: 702,
    price: 113,
    volume: 500,
    unit: "mb",
    plan_type: "gifting",
    network: "glo",
  },
  {
    plan_id: 703,
    price: 226,
    volume: 1,
    unit: "gb",
    plan_type: "gifting",
    network: "glo",
  },
  {
    plan_id: 704,
    price: 452,
    volume: 2,
    unit: "gb",
    plan_type: "gifting",
    network: "glo",
  },
  {
    plan_id: 705,
    price: 678,
    volume: 3,
    unit: "gb",
    plan_type: "gifting",
    network: "glo",
  },
  {
    plan_id: 706,
    price: 1130,
    volume: 5,
    unit: "gb",
    plan_type: "gifting",
    network: "glo",
  },
  {
    plan_id: 707,
    price: 2260,
    volume: 10,
    unit: "gb",
    plan_type: "gifting",
    network: "glo",
  },

  // mtn gifting
  {
    plan_id: 210,
    price: 130,
    volume: 500,
    unit: "mb",
    plan_type: "gifting",
    network: "mtn",
  },
  {
    plan_id: 52,
    price: 260,
    volume: 1,
    unit: "gb",
    plan_type: "gifting",
    network: "mtn",
  },
  {
    plan_id: 51,
    price: 520,
    volume: 2,
    unit: "gb",
    plan_type: "gifting",
    network: "mtn",
  },
  {
    plan_id: 43,
    price: 780,
    volume: 3,
    unit: "gb",
    plan_type: "gifting",
    network: "mtn",
  },
  {
    plan_id: 50,
    price: 1300,
    volume: 5,
    unit: "gb",
    plan_type: "gifting",
    network: "mtn",
  },
  {
    plan_id: 206,
    price: 2600,
    volume: 10,
    unit: "gb",
    plan_type: "gifting",
    network: "mtn",
  },
  {
    plan_id: 218,
    price: 3900,
    volume: 15,
    unit: "gb",
    plan_type: "gifting",
    network: "mtn",
  },
  {
    plan_id: 208,
    price: 5200,
    volume: 20,
    unit: "gb",
    plan_type: "gifting",
    network: "mtn",
  },
  {
    plan_id: 209,
    price: 10400,
    volume: 40,
    unit: "gb",
    plan_type: "gifting",
    network: "mtn",
  },
  {
    plan_id: 219,
    price: 19500,
    volume: 75,
    unit: "gb",
    plan_type: "gifting",
    network: "mtn",
  },
  {
    plan_id: 220,
    price: 26000,
    volume: 100,
    unit: "gb",
    plan_type: "gifting",
    network: "mtn",
  },

  // mtn sme
  {
    plan_id: 301,
    price: 130,
    volume: 500,
    unit: "mb",
    plan_type: "sme",
    network: "mtn",
  },
  {
    plan_id: 302,
    price: 260,
    volume: 1,
    unit: "gb",
    plan_type: "sme",
    network: "mtn",
  },
  {
    plan_id: 303,
    price: 520,
    volume: 2,
    unit: "gb",
    plan_type: "sme",
    network: "mtn",
  },
  {
    plan_id: 304,
    price: 780,
    volume: 3,
    unit: "gb",
    plan_type: "sme",
    network: "mtn",
  },
  {
    plan_id: 305,
    price: 1300,
    volume: 5,
    unit: "gb",
    plan_type: "sme",
    network: "mtn",
  },
  {
    plan_id: 306,
    price: 2600,
    volume: 10,
    unit: "gb",
    plan_type: "sme",
    network: "mtn",
  },

  // airtel
  {
    plan_id: 257,
    price: 21,
    volume: 100,
    unit: "mb",
    plan_type: "gifting",
    network: "airtel",
  },
  {
    plan_id: 258,
    price: 62,
    volume: 300,
    unit: "mb",
    plan_type: "gifting",
    network: "airtel",
  },
  {
    plan_id: 253,
    price: 102.5,
    volume: 500,
    unit: "mb",
    plan_type: "gifting",
    network: "airtel",
  },
  {
    plan_id: 254,
    price: 205,
    volume: 1,
    unit: "gb",
    plan_type: "gifting",
    network: "airtel",
  },
  {
    plan_id: 255,
    price: 410,
    volume: 2,
    unit: "gb",
    plan_type: "gifting",
    network: "airtel",
  },
  {
    plan_id: 256,
    price: 1025,
    volume: 5,
    unit: "gb",
    plan_type: "gifting",
    network: "airtel",
  },
  {
    plan_id: 261,
    price: 2050,
    volume: 10,
    unit: "gb",
    plan_type: "gifting",
    network: "airtel",
  },
  {
    plan_id: 320,
    price: 3075,
    volume: 15,
    unit: "gb",
    plan_type: "gifting",
    network: "airtel",
  },
  {
    plan_id: 262,
    price: 4100,
    volume: 20,
    unit: "gb",
    plan_type: "gifting",
    network: "airtel",
  },

  // 9mobile
  {
    plan_id: 431,
    price: 5,
    volume: 25,
    unit: "mb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 411,
    price: 13,
    volume: 100,
    unit: "mb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 413,
    price: 65,
    volume: 500,
    unit: "mb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 414,
    price: 130,
    volume: 1,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 421,
    price: 195,
    volume: 1.5,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 415,
    price: 260,
    volume: 2,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 420,
    price: 390,
    volume: 3,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 422,
    price: 520,
    volume: 4,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 424,
    price: 585,
    volume: 4.5,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 416,
    price: 650,
    volume: 5,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 417,
    price: 1300,
    volume: 10,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 423,
    price: 1430,
    volume: 11,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 418,
    price: 1950,
    volume: 15,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 419,
    price: 2600,
    volume: 20,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 426,
    price: 5200,
    volume: 40,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 429,
    price: 6500,
    volume: 50,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 428,
    price: 9360,
    volume: 75,
    unit: "gb",
    plan_type: "gifting",
    network: "9mobile",
  },
  {
    plan_id: 430,
    price: 13000,
    volume: 100,
    unit: "gb",
    plan_type: "gifting",
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
