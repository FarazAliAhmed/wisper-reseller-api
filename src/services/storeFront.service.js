const { Account } = require("../models/account");
const dataBalance = require("../models/dataBalance");
const monnifyHistory = require("../models/monnifyHistory");
const storeFront = require("../models/storeFront");
const storeFrontHistory = require("../models/storeFrontHistory");
const userPlan = require("../models/userPlan");
const withdrawalHistory = require("../models/withdrawHistory.model");
const bcrypt = require("bcrypt");

const Flutterwave = require("flutterwave-node-v3");
const { calStoreFrontTax } = require("../utils/sFHelper");
const { default: mongoose } = require("mongoose");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

// withdraw from a store front by business_id
exports.withdrawStoreFrontService = async (
  businessId,
  withType,
  amount,
  password
) => {
  const store = await storeFront.findOne({ business_id: businessId });

  if (!store) {
    throw new Error("Store front not found");
  }

  if (store.wallet < Number(amount)) {
    throw new Error("Insufficient balance");
  }

  const user = await Account.findOne({
    _id: businessId,
  });

  if (!user) {
    throw new Error("user not found");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error("password not correct");
  }

  const userBal = await dataBalance.findOne({ business: businessId });

  if (!userBal) {
    throw new Error("user balance not found");
  }

  const amountTaxed = await calStoreFrontTax(amount);

  if (withType.toLowerCase() === "bank") {
    const reference = generateTransactionReference();

    console.log({ reference });

    const details = {
      account_bank: store.bankCode,
      account_number: store.withdrawAccount,
      amount: Number(amount),
      currency: "NGN",
      narration: "withdraw of ${amount} from store front balance",
      reference: reference,
    };

    flw.Transfer.initiate(details)
      .then(async (res) => {
        console.log(res);

        await storeFront.updateOne(
          { business_id: businessId },
          { $inc: { wallet: -amountTaxed.taxedAmount }, $set: { token: null } }
        );

        const newWithdrawal = new withdrawalHistory({
          businessId: businessId,
          amount: amount,
          withdrawalType: withType,
          tax: amountTaxed.tax,
          description: `withdrawal from store front ₦${amount} to bank account code ${store.bankCode} account number ${store.withdrawAccount}`,
          status: "success",
        });

        await newWithdrawal.save();

        return store;
      })
      .catch((err) => {
        console.log(err);

        throw err;
      });
  } else if (withType.toLowerCase() === "wallet") {
    try {
      const oldBal = store.wallet;

      // store.wallet -= amount;

      await storeFront.updateOne(
        { business_id: businessId },
        { $inc: { wallet: -amount }, $set: { token: null } }
      );

      // userBal.wallet_balance += amount;

      await dataBalance.updateOne(
        { business: businessId },
        { $inc: { wallet_balance: amount } }
      );

      const newWithdrawal = new withdrawalHistory({
        businessId: businessId,
        amount: amount,
        tax: 0,
        withdrawalType: withType,
        description: `withdrawal from store front to wallet balance ₦${amount}`,
        status: "success",
      });

      const newMonnifyHistory = new monnifyHistory({
        business_name: user.name,
        business_id: businessId,
        amount: amount,
        resolvedAmount: userBal.wallet_balance,
        new_bal: Number(userBal.wallet_balance) + Number(oldBal),
        old_bal: userBal.wallet_balance,
        purpose: "Funding - StoreFront",
        desc: `Deposit of ${userBal.wallet_balance} NGN made by ${user.name}.`,
        pay_type: "credit",
        date_of_payment: new Date(),
        payment_ref: "AD-trx-" + Math.floor(Math.random() * 10000000000000000),
      });

      await newWithdrawal.save();
      await newMonnifyHistory.save();
      // await store.save();
      // await userBal.save();

      return store;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};

// ANALYSIS

exports.storeFrontAnalysisService = async (businessId) => {
  const currentDate = new Date();

  // Format the current date as "YYYY-MM-DDT00:00:00.000Z" for comparison
  const todayDate = new Date(currentDate);
  todayDate.setDate(currentDate.getDate() + 1);

  const formattedCurrentDate = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate()
  ).toISOString();

  // Calculate the date filters
  const dateFilters = [
    {
      label: "Today",
      start: formattedCurrentDate.slice(0, 10) + "T00:00:00.000Z",
      end: formattedCurrentDate.slice(0, 10) + "T23:59:59.999Z",
    },
    {
      label: "Yesterday",
      start: formattedCurrentDate.slice(0, 10) + "T00:00:00.000Z",
      end: formattedCurrentDate.slice(0, 10) + "T23:59:59.999Z",
    },
    {
      label: "This Week",
      start: formattedCurrentDate.slice(0, 10) + "T00:00:00.000Z",
      end: formattedCurrentDate.slice(0, 10) + "T23:59:59.999Z",
    },
    {
      label: "This Month",
      start: formattedCurrentDate.slice(0, 7) + "-01T00:00:00.000Z",
      end: formattedCurrentDate.slice(0, 10) + "T23:59:59.999Z",
    },
    {
      label: "Last 30 Days",
      start: formattedCurrentDate.slice(0, 10) + "T00:00:00.000Z",
      end: formattedCurrentDate.slice(0, 10) + "T23:59:59.999Z",
    },
    {
      label: "Last Month",
      start: formattedCurrentDate.slice(0, 7) + "-01T00:00:00.000Z",
      end: formattedCurrentDate.slice(0, 7) + "-31T23:59:59.999Z",
    },
    {
      label: "This Year",
      start: formattedCurrentDate.slice(0, 4) + "-01-01T00:00:00.000Z",
      end: formattedCurrentDate.slice(0, 10) + "T23:59:59.999Z",
    },
    {
      label: "All Time",
      start: "1970-01-01T00:00:00.000Z",
      end: formattedCurrentDate.slice(0, 10) + "T23:59:59.999Z",
    },
  ];

  const analytics = {};

  // Calculate analytics for each date filter
  for (const filter of dateFilters) {
    const { label, start, end } = filter;

    const totalStoreVisit = await storeFrontHistory.countDocuments({
      storeBusiness: businessId,
      createdAt: {
        $gte: start,
        $lt: end,
      },
    });

    const totalAmountSold = await storeFrontHistory
      .aggregate([
        {
          $match: {
            storeBusiness: businessId,
            createdAt: {
              $gte: start,
              $lt: end,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmountSold: {
              $sum: {
                $toDouble: "$price",
              },
            },
          },
        },
      ])
      .exec();

    const totalRevenue =
      totalAmountSold.length > 0 ? totalAmountSold[0].totalAmountSold : 0;

    const totalTransaction = await storeFrontHistory.countDocuments({
      storeBusiness: businessId,
      createdAt: {
        $gte: start,
        $lt: end,
      },
    });

    analytics[label] = {
      TotalStoreVisits: totalStoreVisit,
      TotalAmountSold: totalAmountSold,
      TotalRevenue: totalRevenue,
      TotalTransactions: totalTransaction,
    };
  }

  return analytics;
};

exports.storeFrontUserPlanService = async () => {
  const notAllowedTypes = ["admin"];

  try {
    const allUsers = await Account.find({
      type: { $nin: notAllowedTypes },
    });

    // const body = {
    //   plan_id: 431,
    //   network: "glo",
    //   plan_type: "gifting",
    //   price: 0,
    //   volume: 25,
    //   unit: "mb",
    //   validity: "30 days",
    // };

    // const toMap = [
    //   { plan_id: 701, price: 50, volume: 200, unit: "mb" },
    //   { plan_id: 702, price: 125, volume: 500, unit: "mb" },
    //   { plan_id: 703, price: 250, volume: 1, unit: "gb" },
    //   { plan_id: 704, price: 500, volume: 2, unit: "gb" },
    //   { plan_id: 705, price: 750, volume: 3, unit: "gb" },
    //   { plan_id: 706, price: 1250, volume: 5, unit: "gb" },
    //   { plan_id: 707, price: 2500, volume: 10, unit: "gb" },
    // ];

    const body = {
      plan_id: 431,
      network: "9mobile",
      plan_type: "cg",
      price: 0,
      volume: 25,
      unit: "mb",
      validity: "30 days",
    };

    const toMap = [
      // { plan_id: 376, price: d10, volume: 10, unit: "mb" },
      // { plan_id: 377, price: 1d5, volume: 15, unit: "mb" },
      { plan_id: 431, price: 5, volume: 25, unit: "mb" },
      { plan_id: 411, price: 20, volume: 100, unit: "mb" },
      { plan_id: 413, price: 80, volume: 500, unit: "mb" },
      { plan_id: 414, price: 160, volume: 1, unit: "gb" },
      { plan_id: 421, price: 240, volume: 1.5, unit: "gb" },
      { plan_id: 415, price: 320, volume: 2, unit: "gb" },
      { plan_id: 420, price: 480, volume: 3, unit: "gb" },
      { plan_id: 422, price: 640, volume: 4, unit: "gb" },
      { plan_id: 424, price: 720, volume: 4.5, unit: "gb" },
      { plan_id: 416, price: 800, volume: 5, unit: "gb" },
      { plan_id: 417, price: 1600, volume: 10, unit: "gb" },
      { plan_id: 423, price: 1760, volume: 11, unit: "gb" },
      { plan_id: 429, price: 8000, volume: 50, unit: "gb" },
      { plan_id: 430, price: 16000, volume: 100, unit: "gb" },
    ];

    for (let i = 0; i < allUsers.length; i++) {
      const currUser = allUsers[i]._id;
      for (let j = 0; j < toMap.length; j++) {
        try {
          // const newPlan = new userPlan({
          //   business: currUser._id,
          //   plan_id: toMap[j].plan_id,
          //   network: body.network,
          //   plan_type: body.plan_type,
          //   price: toMap[j].price,
          //   volume: toMap[j].volume,
          //   unit: toMap[j].unit,
          //   validity: body.validity,
          // });
          // newPlan.save();
        } catch (error) {
          console.log("failed to create plan for", currUser.name);
        }
      }
    }

    return allUsers;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.storeFrontUserPlanSingle = async (business) => {
  try {
    const objbusinessId = mongoose.Types.ObjectId(`${business}`);

    const currUser = await Account.findOne({
      _id: objbusinessId,
    });

    // console.log({ currUser });

    const body = {
      plan_id: 431,
      network: "glo",
      plan_type: "gifting",
      price: 0,
      volume: 25,
      unit: "mb",
      validity: "30 days",
    };

    const toMap = [
      { plan_id: 701, price: 50, volume: 200, unit: "mb" },
      { plan_id: 702, price: 125, volume: 500, unit: "mb" },
      { plan_id: 703, price: 250, volume: 1, unit: "gb" },
      { plan_id: 704, price: 500, volume: 2, unit: "gb" },
      { plan_id: 705, price: 750, volume: 3, unit: "gb" },
      { plan_id: 706, price: 1250, volume: 5, unit: "gb" },
      { plan_id: 707, price: 2500, volume: 10, unit: "gb" },
    ];

    for (let j = 0; j < toMap.length; j++) {
      try {
        const newPlan = new userPlan({
          business: currUser._id,
          plan_id: toMap[j].plan_id,
          network: body.network,
          plan_type: body.plan_type,
          price: toMap[j].price,
          volume: toMap[j].volume,
          unit: toMap[j].unit,
          validity: body.validity,
        });

        newPlan.save();
      } catch (error) {
        console.log("failed to create plan for", currUser.name);
      }
    }

    return currUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

function generateTransactionReference() {
  const timestamp = new Date().toISOString().replace(/[-T:Z.]/g, ""); // Convert current timestamp to a string and remove '-', 'T', ':', 'Z', and '.'
  const randomString = Math.random().toString(36).substring(2, 8); // Generate a random 6-character alphanumeric string

  const transactionReference = `${timestamp}${randomString}`;
  return transactionReference;
}
