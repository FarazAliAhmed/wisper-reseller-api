const { Account } = require("../models/account");
const dataBalance = require("../models/dataBalance");
const monnifyHistory = require("../models/monnifyHistory");
const storeFront = require("../models/storeFront");
const StoreFront = require("../models/storeFront");
const storeFrontHistory = require("../models/storeFrontHistory");
const withdrawalHistory = require("../models/withdrawHistory.model");

const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

// // Get a store front by business_id
// exports.getStoreFrontByBusinessId = async (businessId) => {
//   try {
//     const storeFront = await StoreFront.findOne({ business_id: businessId });
//     return storeFront;
//   } catch (error) {
//     throw error;
//   }
// };

// // Get all store fronts
// exports.getAllStoreFronts = async () => {
//   try {
//     const storeFronts = await StoreFront.find();
//     return storeFronts;
//   } catch (error) {
//     throw error;
//   }
// };

// // Create a new store front
// exports.createStoreFront = async (data) => {
//   // Check if the data contains the 'wallet' field
//   if ("wallet" in data) {
//     throw new Error(
//       'Cannot include the "wallet" field when creating a store front.'
//     );
//   }

//   try {
//     const newStoreFront = new StoreFront(data);
//     const savedStoreFront = await newStoreFront.save();
//     return savedStoreFront;
//   } catch (error) {
//     throw error;
//   }
// };

// // Update a store front by business_id
// exports.updateStoreFront = async (businessId, updates) => {
//   // Check if the updates contain the 'wallet' field
//   if ("wallet" in updates) {
//     throw new Error(
//       'Cannot include the "wallet" field when updating a store front.'
//     );
//   }

//   try {
//     const updatedStoreFront = await StoreFront.findOneAndUpdate(
//       { business_id: businessId },
//       updates,
//       { new: true }
//     );
//     return updatedStoreFront;
//   } catch (error) {
//     throw error;
//   }
// };

// withdraw from a store front by business_id
exports.withdrawStoreFrontService = async (businessId, withType, amount) => {
  const store = await storeFront.findOne({ business_id: businessId });

  if (!store) {
    throw new Error("Store front not found");
  }

  const userBal = await dataBalance.findOne({ business: businessId });

  if (!userBal) {
    throw new Error("user balance not found");
  }

  const user = await Account.findOne({
    _id: addData.business_id,
  });

  if (withType.toLowerCase() === "bank") {
    const reference = generateTransactionReference();

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

        store.wallet -= amount;

        const newWithdrawal = new withdrawalHistory({
          businessId: businessId,
          amount: amount,
          withdrawalType: withType,
          description: `withdrawal from store front ₦${amount} to bank account code ${store.bankCode} account number ${store.withdrawAccount}`,
          status: "success",
        });

        await newWithdrawal.save();
        await store.save();

        return store;
      })
      .catch((err) => {
        console.log(err);

        throw err;
      });
  } else if (withType.toLowerCase() === "wallet") {
    try {
      const oldBal = store.wallet;

      store.wallet -= amount;
      userBal.wallet_balance += amount;

      const newWithdrawal = new withdrawalHistory({
        businessId: businessId,
        amount: amount,
        withdrawalType: withType,
        description: `withdrawal from store front to wallet balance ₦${amount}`,
        status: "success",
      });

      const newMonnifyHistory = new monnifyHistory({
        business_name: user.name,
        business_id: businessId,
        amount: amount,
        resolvedAmount: userBal.wallet_balance,
        new_bal: userBal.wallet_balance,
        old_bal: oldBal,
        purpose: "Funding - StoreFront",
        desc: `Deposit of ${balance.wallet_balance} NGN made by ${user.name}.`,
        pay_type: "credit",
        date_of_payment: new Date(),
        payment_ref: "AD-trx-" + Math.floor(Math.random() * 10000000000000000),
      });

      await newWithdrawal.save();
      await newMonnifyHistory.save();
      await store.save();
      await userBal.save();

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
      date: {
        $gte: start,
        $lt: end,
      },
    });

    const totalAmountSold = await storeFrontHistory
      .aggregate([
        {
          $match: {
            date: {
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
      date: {
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
