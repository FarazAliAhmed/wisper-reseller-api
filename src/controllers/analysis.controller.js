const BucketUsage = require("../models/BucketUsage");
const WalletUsage = require("../models/WalletUsage");
const bucketID = require("../models/bucketID");
const dataBalance = require("../models/dataBalance");
const monnifyHistory = require("../models/monnifyHistory");
const paymentHistory = require("../models/paymentHistory");
const transactionHistory = require("../models/transactionHistory");
const Transaction = require("../models/transactionHistory");

const payment_analysis = async (req, res) => {
  const walletTypes = ["airtel", "glo", "mtn_gifting", "9mobile"];

  const pipeline = [
    {
      $match: {
        wallet: { $in: walletTypes },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: { $toDate: "$date_of_payment" } },
          wallet: "$wallet",
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        wallet: "$_id.wallet",
        total: 1,
      },
    },
  ];

  try {
    const results = await paymentHistory.aggregate(pipeline);

    res.json(results);
  } catch (error) {
    // Handle error
    console.error("Error calculating wallet totals:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const revenueAnalysis = async (req, res) => {
  try {
    const currentDate = new Date();

    // Calculate the start and end dates for different time periods
    const todayStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const todayEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + 1
    );

    const yesterdayStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 1
    );

    const yesterdayEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const thisMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const thisMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const prevMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );

    const prevMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );

    const thisYearStart = new Date(currentDate.getFullYear(), 0, 1);

    const thisYearEnd = new Date(currentDate.getFullYear() + 1, 0, 0);

    const successStats = await Transaction.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: "$network_provider",
          count: { $sum: 1 },
          totalDataSold: { $sum: "$data_volume" },
        },
      },
      {
        $project: {
          _id: 0,
          network_provider: "$_id",
          count: 1,
          totalDataSold: 1,
        },
      },
    ]);

    const failedStats = await Transaction.aggregate([
      { $match: { status: "failed" } },
      {
        $group: {
          _id: "$network_provider",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          network_provider: "$_id",
          count: 1,
        },
      },
    ]);

    const getTransactionCountByDateRange = async (
      startDate,
      endDate,
      status
    ) => {
      function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}/${month}/${day}`;
      }

      // console.log("start date", `${formatDate(startDate)} 12:00:00 AM`);
      // console.log("end date", `${formatDate(endDate)} 11:59:59 PM`);

      const stats = await Transaction.aggregate([
        {
          $match: {
            status,
            created_at: {
              $gte: `${formatDate(startDate)} 12:00:00 AM`,
              $lt: `${formatDate(endDate)} 11:59:59 PM`,
            },
          },
        },
        {
          $group: {
            _id: "$network_provider",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            network_provider: "$_id",
            count: 1,
          },
        },
      ]);

      return stats;
    };

    const successTodayStats = await getTransactionCountByDateRange(
      todayStart,
      todayEnd,
      "success"
    );

    const successYesterdayStats = await getTransactionCountByDateRange(
      yesterdayStart,
      yesterdayEnd,
      "success"
    );

    const successThisMonthStats = await getTransactionCountByDateRange(
      thisMonthStart,
      thisMonthEnd,
      "success"
    );

    const successPrevMonthStats = await getTransactionCountByDateRange(
      prevMonthStart,
      prevMonthEnd,
      "success"
    );

    const successThisYearStats = await getTransactionCountByDateRange(
      thisYearStart,
      thisYearEnd,
      "success"
    );

    const successAllTimeStats = successStats;

    const failedTodayStats = await getTransactionCountByDateRange(
      todayStart,
      todayEnd,
      "failed"
    );

    const failedYesterdayStats = await getTransactionCountByDateRange(
      yesterdayStart,
      yesterdayEnd,
      "failed"
    );

    const failedThisMonthStats = await getTransactionCountByDateRange(
      thisMonthStart,
      thisMonthEnd,
      "failed"
    );

    const failedPrevMonthStats = await getTransactionCountByDateRange(
      prevMonthStart,
      prevMonthEnd,
      "failed"
    );

    const failedThisYearStats = await getTransactionCountByDateRange(
      thisYearStart,
      thisYearEnd,
      "failed"
    );

    const failedAllTimeStats = failedStats;

    const calculateTotalCount = (stats) => {
      return stats.reduce((total, stat) => total + stat.count, 0);
    };

    const result = {
      success: {
        today: {
          total: calculateTotalCount(successTodayStats),
          byNetworkProvider: successTodayStats,
        },
        yesterday: {
          total: calculateTotalCount(successYesterdayStats),
          byNetworkProvider: successYesterdayStats,
        },
        thisMonth: {
          total: calculateTotalCount(successThisMonthStats),
          byNetworkProvider: successThisMonthStats,
        },
        prevMonth: {
          total: calculateTotalCount(successPrevMonthStats),
          byNetworkProvider: successPrevMonthStats,
        },
        thisYear: {
          total: calculateTotalCount(successThisYearStats),
          byNetworkProvider: successThisYearStats,
        },
        allTime: {
          total: calculateTotalCount(successAllTimeStats),
          byNetworkProvider: successAllTimeStats,
        },
      },
      failed: {
        today: {
          total: calculateTotalCount(failedTodayStats),
          byNetworkProvider: failedTodayStats,
        },
        yesterday: {
          total: calculateTotalCount(failedYesterdayStats),
          byNetworkProvider: failedYesterdayStats,
        },
        thisMonth: {
          total: calculateTotalCount(failedThisMonthStats),
          byNetworkProvider: failedThisMonthStats,
        },
        prevMonth: {
          total: calculateTotalCount(failedPrevMonthStats),
          byNetworkProvider: failedPrevMonthStats,
        },
        thisYear: {
          total: calculateTotalCount(failedThisYearStats),
          byNetworkProvider: failedThisYearStats,
        },
        allTime: {
          total: calculateTotalCount(failedAllTimeStats),
          byNetworkProvider: failedAllTimeStats,
        },
      },
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const totalCurrentCredit = async (req, res) => {
  try {
    const walletTypes = ["airtel", "glo", "mtn_gifting", "9mobile"];
    const payTypes = ["debit", "paid"];

    const paymentStats = await paymentHistory.aggregate([
      {
        $match: {
          wallet: { $in: walletTypes },
          pay_type: { $in: payTypes },
        },
      },
      {
        $group: {
          _id: "$wallet",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const response = paymentStats.reduce(
      (result, paymentStat) => {
        if (paymentStat._id === "glo") {
          result.glo.amount = paymentStat.totalAmount;
          result.glo.noOfPayments = paymentStat.count;
        } else if (paymentStat._id === "mtn") {
          result.mtn.amount = paymentStat.totalAmount;
          result.mtn.noOfPayments = paymentStat.count;
        } else if (paymentStat._id === "airtel") {
          result.airtel.amount = paymentStat.totalAmount;
          result.airtel.noOfPayments = paymentStat.count;
        } else if (paymentStat._id === "9mobile") {
          result["9mobile"].amount = paymentStat.totalAmount;
          result["9mobile"].noOfPayments = paymentStat.count;
        }

        result.allNetworks.amount += paymentStat.totalAmount;
        result.allNetworks.noOfPayments += paymentStat.count;

        return result;
      },
      {
        allNetworks: {
          amount: 0,
          noOfPayments: 0,
        },
        glo: {
          amount: 0,
          data: 0,
          noOfPayments: 0,
        },
        mtn: {
          amount: 0,
          data: 0,
          noOfPayments: 0,
        },
        airtel: {
          amount: 0,
          data: 0,
          noOfPayments: 0,
        },
        "9mobile": {
          amount: 0,
          data: 0,
          noOfPayments: 0,
        },
      }
    );

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const paymentTable = async (req, res) => {
  const payTypes = ["debit", "paid"];

  try {
    const totalIncomeBalance = await paymentHistory.aggregate([
      {
        $match: { pay_type: "paid" },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalCreditBalance = await paymentHistory.aggregate([
      {
        $match: { pay_type: "paid" },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalDebit = await paymentHistory.aggregate([
      {
        $match: { pay_type: "debit" },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalTransactionValue = await paymentHistory.aggregate([
      {
        $match: { pay_type: { $in: payTypes } },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const response = {
      totalCreditBalance: {
        amount:
          totalCreditBalance.length > 0 ? totalCreditBalance[0].amount : 0,
        noOfPayments:
          totalCreditBalance.length > 0 ? totalCreditBalance[0].count : 0,
      },
      totalIncomeBalance: {
        amount:
          totalIncomeBalance.length > 0 ? totalIncomeBalance[0].amount : 0,
        noOfPayments:
          totalIncomeBalance.length > 0 ? totalIncomeBalance[0].count : 0,
      },
      totalDebit: {
        amount: totalDebit.length > 0 ? totalDebit[0].amount : 0,
        noOfPayments: totalDebit.length > 0 ? totalDebit[0].count : 0,
      },
      totalTransactionValue: {
        amount:
          totalTransactionValue.length > 0
            ? totalTransactionValue[0].amount
            : 0,
        noOfPayments:
          totalTransactionValue.length > 0 ? totalTransactionValue[0].count : 0,
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const walletAnalysis = async (req, res) => {
  try {
    const walletSum = await dataBalance.aggregate([
      {
        $group: {
          _id: null,
          gloBalance: { $sum: "$mega_wallet.glo" },
          mtnBalance: {
            $sum: {
              $add: ["$mega_wallet.mtn_sme", "$mega_wallet.mtn_gifting"],
            },
          },
          "9mobileBalance": { $sum: "$mega_wallet.9mobile" },
          airtelBalance: { $sum: "$mega_wallet.airtel" },
        },
      },
    ]);

    if (walletSum.length === 0) {
      return res.status(404).json({ message: "No wallet balance found" });
    }

    const networkBalances = {
      glo: walletSum[0].gloBalance,
      mtn: walletSum[0].mtnBalance,
      "9mobile": walletSum[0]["9mobileBalance"],
      airtel: walletSum[0].airtelBalance,
    };

    res.json(networkBalances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const calWalBal_analysis = async (req, res) => {
  try {
    const result = await dataBalance.aggregate([
      {
        $group: {
          _id: null,
          totalWalletBalance: { $sum: "$wallet_balance" },
          gloBal: { $sum: "$mega_wallet.glo" },
          mtn_smeBal: { $sum: "$mega_wallet.mtn_sme" },
          mtn_giftingBal: { $sum: "$mega_wallet.mtn_gifting" },
          airtelBal: { $sum: "$mega_wallet.airtel" },
          "9mobileBal": { $sum: "$mega_wallet.9mobile" },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const totalBalance = result[0];
    return res.json({ totalWalletBalance: totalBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST route to populate BucketUsage for a specific day
const populateBucketUsage = async (req, res) => {
  try {
    const currentDate = new Date();

    // Format the current date as "YYYY-MM-DDT00:00:00.000Z" for comparison
    const formattedCurrentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    ).toISOString();

    // Find the transactions for the specified day
    const firstTransaction = await transactionHistory
      .findOne({
        status: "success",
        createdAt: {
          $gte: `${formattedCurrentDate.slice(0, 10)}T00:00:00.000Z`,
          $lt: `${formattedCurrentDate.slice(0, 10)}T23:59:59.999Z`,
        },
      })
      .sort({ createdAt: -1 });

    async function getLastTransaction() {
      return await transactionHistory.findOne().sort({ timestamp: -1 });
    }

    const lastTransaction = await getLastTransaction();

    // Calculate the date for the previous day
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);

    const formattedPreviousDate = new Date(
      previousDate.getFullYear(),
      previousDate.getMonth(),
      previousDate.getDate()
    ).toISOString();

    const transactions = await transactionHistory.find({
      status: "success",
      network_provider: "glo",
      createdAt: {
        $gte: `${formattedPreviousDate.slice(0, 10)}T00:00:00.000Z`,
        $lt: `${formattedPreviousDate.slice(0, 10)}T23:59:59.999Z`,
      },
    });

    const dataSoldOnWisper = transactions.reduce(
      (total, transaction) => total + transaction.data_volume,
      0
    ); // Calculate the total data sold on all providers

    const numberOfTransactions = transactions.length;

    const dataSoldOnGlo =
      Number(firstTransaction.gloB) - Number(lastTransaction.gloB);

    const balance = Math.abs(Number(dataSoldOnGlo) - Number(dataSoldOnWisper));
    const status = Math.abs(balance) < 10000 ? "Green" : "Red";

    // Create a new BucketUsage document
    const bucketUsage = new BucketUsage({
      date: formattedCurrentDate,
      bucketID,
      startOfDayBalance: firstTransaction.gloB,
      endOfDayBalance: lastTransaction.gloB,
      dataSoldOnGlo,
      dataSoldOnWisper,
      numberOfTransactions,
      balance,
      status,
    });

    // Save the BucketUsage document
    await bucketUsage.save();
    console.log("bucketusage added");

    res.status(201).json(bucketUsage);
  } catch (error) {
    console.log("error in adding bucketusage");
    console.error(error);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const populateBucketUsage = async (req, res) => {
//   try {
//     const currentDate = new Date();

//     // Format the current date as "YYYY-MM-DDT00:00:00.000Z" for comparison
//     const formattedCurrentDate = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth(),
//       currentDate.getDate()
//     ).toISOString();

//     // Find the transactions for the specified day
//     const transactions = await transactionHistory.find({
//       status: "success",
//       createdAt: {
//         $gte: `${formattedCurrentDate.slice(0, 10)}T00:00:00.000Z`,
//         $lt: `${formattedCurrentDate.slice(0, 10)}T23:59:59.999Z`,
//       },
//     });

//     // console.log(transactions);

//     // Calculate the required values based on transactions
//     const startOfDayBalance =
//       transactions.length > 0 ? transactions[0].new_balance : 0;
//     const endOfDayBalance =
//       transactions.length > 0
//         ? transactions[transactions.length - 1].new_balance
//         : 0;
//     const dataSoldOnGlo = Math.abs(endOfDayBalance.glo - startOfDayBalance.glo);
//     const totalDataSold = transactions.reduce(
//       (total, transaction) => total + transaction.data_volume,
//       0
//     ); // Calculate the total data sold on all providers
//     const dataSoldOnWisper = Math.abs(totalDataSold - dataSoldOnGlo); // Calculate data sold on Wisper

//     const numberOfTransactions = transactions.length;
//     const balance = Math.abs(dataSoldOnGlo - dataSoldOnWisper);
//     const status = Math.abs(balance) < 10000 ? "Green" : "Red";

//     // Get the bucketID for the day (You can customize this logic)
//     const bucketID = await getBucketIDForDate(formattedCurrentDate);

//     // Create a new BucketUsage document
//     const bucketUsage = new BucketUsage({
//       date: formattedCurrentDate,
//       bucketID,
//       startOfDayBalance,
//       endOfDayBalance,
//       dataSoldOnGlo,
//       dataSoldOnWisper,
//       numberOfTransactions,
//       balance,
//       status,
//     });

//     // Save the BucketUsage document
//     await bucketUsage.save();
//     console.log("bucketusage added");

//     res.status(201).json(bucketUsage);
//   } catch (error) {
//     console.log("error in adding bucketusage");
//     console.error(error);

//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// POST route to populate BucketUsage for a specific day
const populateWalletUsage = async (req, res) => {
  try {
    const currentDate = new Date();

    // Format the current date as "YYYY-MM-DDT00:00:00.000Z" for comparison
    const formattedCurrentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    ).toISOString();

    // Find the transactions for the specified day
    const transactions = await monnifyHistory.find({
      createdAt: {
        $gt: `${formattedCurrentDate.slice(0, 10)}T00:00:00.000Z`,
        $lt: `${formattedCurrentDate.slice(0, 10)}T00:59:59.999Z`,
      },
    });

    const transactions1 = await monnifyHistory.find({
      createdAt: {
        $gt: `${formattedCurrentDate.slice(0, 10)}T23:00:00.000Z`,
        $lt: `${formattedCurrentDate.slice(0, 10)}T23:59:59.999Z`,
      },
    });

    console.log(transactions);

    // Calculate the required values based on transactions
    const startOfDayBalance = transactions.reduce(
      (total, transaction) => total + transaction.new_bal,
      0
    );

    const endOfDayBalance = transactions1.reduce(
      (total, transaction) => total + transaction.new_bal,
      0
    );

    // Calculate the total amount on wisper
    // const dataSoldOnWisper = totalDataSold - dataSoldOnGlo;

    const numberOfTransactions = transactions.length;
    // const balance = dataSoldOnGlo - dataSoldOnWisper;
    // const status = Math.abs(balance) < 10 ? "Green" : "Red";

    // Get the bucketID for the day (You can customize this logic)
    const bucketID = await getBucketIDForDate(formattedCurrentDate);

    // Create a new BucketUsage document
    const bucketUsage = new WalletUsage({
      date: formattedCurrentDate,
      startOfDayBalance,
      endOfDayBalance,
      // dataSoldOnWisper,
      // numberOfTransactions,
      // balance,
      // status,
    });

    // Save the BucketUsage document
    await bucketUsage.save();

    res.status(201).json(bucketUsage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to get the bucketID for a specific date (customize this logic)
async function getBucketIDForDate() {
  const defaultBucket = await bucketID.findOne({ inUse: true });
  return defaultBucket ? defaultBucket.bucketID : null;
}

module.exports = {
  payment_analysis,
  revenueAnalysis,
  totalCurrentCredit,
  paymentTable,
  walletAnalysis,
  calWalBal_analysis,
  populateBucketUsage,
  populateWalletUsage,
};
