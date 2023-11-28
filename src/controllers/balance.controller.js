const lodash = require("lodash");
const IntegrationResponse = require("../models/integrationResponse");
const {
  getBalance,
  getWallet,
  getAllBalance,
  credit,
  debit,
  upgradeAllBalance,
} = require("../services/balance.service");
const axios = require("axios");

const { superjara_balance, simserver_balance } = require("../utils");

// Balance is created when business account is created. Check "post" middleware in balance Schema defination
const getAccountBalance = async (req, res) => {
  const businessId = req.user._id;
  const resp = await getBalance(businessId);
  if (resp.balance) return res.status(200).json(resp.balance);
  return res.status(resp.status).json(resp);
};

const getWalletBalance = async (req, res) => {
  const businessId = req.user._id;
  const resp = await getWallet(businessId);
  if (resp.balance) {
    const wResp = {
      ...lodash.pick(resp.balance, "mega_wallet"),
      lite_wallet: {
        cash_balance: resp.balance.wallet_balance,
        unit: resp.balance.data_unit,
      },
      last_purchase: resp.balance.last_purchase,
    };
    return res.status(200).json(wResp);
  }
  return res.status(resp.status).json(resp);
};

const getAllBusinessBalances = async (req, res) => {
  const allBalance = await getAllBalance();
  if (allBalance.balances) return res.status(200).json(allBalance.balances);
  return res.status(allBalance.status).json(allBalance);
};

const creditBalance = async (req, res) => {
  const businessId = req.body.business_id;
  const creditAmount = req.body.credit_amount;

  // unit: "money" is for lite user type. Which should be the default.
  // unit: "data" is for mega user type
  let unit = req.body.unit || "money";

  // add field wallet to request body when the unit is in data
  // check dataBalance schema to see proper values for
  const wallet = req.body.wallet;
  const allowedWallets = ["mtn_sme", "mtn_gifting", "airtel", "glo", "9mobile"];

  let field;
  if (unit === "data" && wallet) {
    if (allowedWallets.includes(wallet)) {
      field = `mega_wallet.${wallet}`;
    } else {
      return res.status(400).json({
        status: 400,
        message:
          'This wallet type does not exist. Allowed types are: ["mtn_sme", "mtn_gifting", "airtel", "glo", "9mobile"] ',
      });
    }
  } else if (unit === "money") {
    field = "wallet_balance";
  } else {
    return res.status(400).json({
      status: 400,
      message: "You must set a 'wallet' field when allocating to a data wallet",
    });
  }

  const newBalance = await credit(businessId, creditAmount, field);
  if (newBalance.error)
    return res.status(400).json({
      status: 400,
      message: "Error. Unable to credit account balance",
    });
  res.status(newBalance.status).json({
    status: newBalance.status,
    message: newBalance.message,
    newBalance: newBalance.balance,
  });
};

const debitBalance = async (req, res) => {
  const businessId = req.body.business_id;
  const debitAmount = req.body.debit_amount;

  let unit = req.body.unit || "money";
  const wallet = req.body.wallet;
  const allowedWallets = ["mtn_sme", "mtn_gifting", "airtel", "glo", "9mobile"];

  let field;
  if (unit === "data" && wallet) {
    if (allowedWallets.includes(wallet)) {
      field = `mega_wallet.${wallet}`;
    } else {
      return res.status(400).json({
        status: 400,
        message:
          'This wallet type does not exist. Allowed types are: ["mtn_sme", "mtn_gifting", "airtel", "glo", "9mobile"] ',
      });
    }
  } else if (unit === "money") {
    field = "wallet_balance";
  } else {
    return res.status(400).json({
      status: 400,
      message: "You must set a 'wallet' field when allocating to a data wallet",
    });
  }

  const newBalance = await debit(businessId, debitAmount, field);
  if (newBalance.error)
    return res.status(200).json({
      status: 200,
      message: "Warning! Account balance is now negative",
    });
  res.status(newBalance.status).json({
    status: newBalance.status,
    message: newBalance.message,
    newBalance: newBalance.balance,
  });
};

const updateAllBalance = async (req, res) => {
  const allBalance = await upgradeAllBalance();
  if (allBalance.error)
    return res.status(400).json({
      status: 400,
      message: "Error. Unable to upgrade all balance accounts",
    });
  res.status(allBalance.status).json({
    status: allBalance.status,
    message: allBalance.message,
    allBalance,
  });
};

const getApiBalance = async (req, res) => {
  let mob9 = 0;
  let mtn = 0;
  let airtel = 0;
  let glo = 0;

  const mobile9 = "https://simhosting.ogdams.ng/api/v1/get/balances";
  const mtnUrl =
    "https://apisubportal.com/api/balance.php?api_key=652cf58c55dbe87b507bc1d384fb6bf0";
  const headers1 = {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer sk_live_41c0c0b0-73e6-4c5e-a246-317e38437a9b",
    },
  };

  try {
    const response1 = await axios.get(mobile9, headers1);
    // console.log(response1.data);
    const response2 = await axios.get(mtnUrl);
    // console.log(response2.data);
    return res.status(200).json({
      mob9: response1.data.data.msg.mainBalance || mob9,
      mtn: response2.data.balance || mtn,
      airtel,
      glo,
    });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ error });
  }
};

const updateBalance = async (req, res) => {};

const resetBalance = async (req, res) => {};

module.exports = {
  getAccountBalance,
  getWalletBalance,
  getAllBusinessBalances,
  updateBalance,
  resetBalance,
  creditBalance,
  debitBalance,
  updateAllBalance,
  getApiBalance,
};
