const paymentHistory = require("../models/paymentHistory");

const monthly_analysis = async (req, res) => {
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

module.exports = {
  monthly_analysis,
};
