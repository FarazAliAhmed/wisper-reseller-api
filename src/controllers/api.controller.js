const apiBalanceModel = require("../models/apiBalance.model");

exports.getAllApiBalances = async (req, res) => {
  try {
    const allApis = await apiBalanceModel.find();

    return res.json(allApis);
  } catch (error) {
    console.error(error); // Use console.error instead of console.log for errors
    return res.status(500).json({
      error: error.message,
    });
  }
};
