const Joi = require("joi");
const {
  getAll,
  getAllB,
  getOne,
  deleteOne,
  update,
  create,
  getAllApi,
  getOneApi,
} = require("../services/transaction.service");
const Transaction = require("../models/transactionHistory");

const postTransaction = async (req, res) => {
  const { body } = req;
  const { error } = validatePostTransaction(body);
  if (error)
    return res
      .status(500)
      .json({ status: 500, message: error.details[0].message });
  const resp = await create(body);
  if (resp)
    return res
      .status(201)
      .json({ ...resp, message: "Successfully added transaction" });
  return res
    .status(500)
    .json({ status: 500, message: "Error adding transaction" });
};

const getTransaction = async (req, res) => {
  // used by both admin and user to get single transaction
  const transaction_ref = req.params.id;
  const resp = await getOne(transaction_ref);
  if (resp.transaction) return res.status(200).json(resp.transaction);
  return res.status(resp.status).json(resp);
};

const getSingleApiTransaction = async (req, res) => {
  // used by both admin and user to get single transaction
  const transaction_ref = req.params.id;
  const resp = await getOneApi(transaction_ref);
  if (resp.transaction) return res.status(200).json(resp.transaction);
  return res.status(resp.status).json(resp);
};

const getAllTransaction = async (req, res) => {
  // used by a single user to get all his transactions
  const businessId = req.user._id;
  const resp = await getAll(businessId);
  if (resp.transactions) return res.status(200).json(resp.transactions);
  return res.status(resp.status).json(resp);
};

const getAllApiTransaction = async (req, res) => {
  // used by a single user to get all his transactions
  const businessId = req.user._id;
  const resp = await getAllApi(businessId);
  if (resp.transactions) return res.status(200).json(resp.transactions);
  return res.status(resp.status).json(resp);
};

// route to get the sum of transactions for a business ID
const totalTrxSingle = async (req, res) => {
  const userID = req.params.id;

  try {
    // Get the sum of transactions for the business ID
    const transactionCount = await Transaction.countDocuments({
      business_id: userID,
    });

    res.json({
      transactionCount,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

// route to get the total data sold for a business ID
const totalDataSoldSingle = async (req, res) => {
  const userID = req.params.id;

  try {
    // Get the total data sold for the business ID
    const totalDataSold = await Transaction.aggregate([
      {
        $match: { business_id: userID },
      },
      {
        $group: {
          _id: null,
          totalDataSold: { $sum: "$data_volume" },
        },
      },
    ]);

    console.log(totalDataSold);

    res.json({
      totalDataSold: totalDataSold[0]?.totalDataSold || 0,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

// route to get the total data sold across all business IDs
const totalDataSoldAll = async (req, res) => {
  try {
    // Get the total data sold
    const totalDataSold = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalDataSold: { $sum: "$data_volume" },
        },
      },
    ]);

    res.json({
      totalDataSold: totalDataSold[0].totalDataSold,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

// route to get the total transactions made across all business IDs
const totalTrxAll = async (req, res) => {
  try {
    // Get the total number of transactions
    const totalTransactions = await Transaction.countDocuments();

    res.json({
      totalTransactions,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const getAllBusinessTransactions = async (req, res) => {
  // used by admin to get all transactions of businesses
  const resp = await getAllB();
  if (resp.transactions) return res.status(200).json(resp.transactions);
  return res.status(resp.status).json(resp);
};

const updateTransaction = async (req, res) => {
  const transactionId = req.params.id;
  const { body } = req;
  const query = { _id: transactionId }; //What to search the transaction by

  const resp = await update(query, body);
  if (resp)
    return res
      .status(201)
      .json({ ...resp, message: "Record deleted successfully" });
  return res
    .status(500)
    .json({ status: 500, message: "Error deleting transaction" });
};

const deleteTransaction = async (req, res) => {
  const transactionId = req.params.id;
  const resp = await deleteOne(transactionId);
  if (resp) return res.status(200).json(resp);
  return res.status(500).json({
    status: 500,
    message: "Unable to delete transaction at this time",
  });
};

const validatePostTransaction = (body) => {
  const schema = Joi.object({
    transaction_ref: Joi.string().required(),
    phone_number: Joi.string().required(),
    data_volume: Joi.number(),
    data_price: Joi.number().required(),
    business_id: Joi.string().required(),
    network_provider: Joi.string().max(10),
    status: Joi.string()
      .valid("success", "failed", "processing")
      .required()
      .max(20),
  });
  return schema.validate(body);
};

module.exports = {
  getTransaction,
  getAllTransaction,
  postTransaction,
  getAllBusinessTransactions,
  updateTransaction,
  deleteTransaction,
  totalDataSoldAll,
  totalDataSoldSingle,
  totalTrxAll,
  totalTrxSingle,
  getAllApiTransaction,
  getSingleApiTransaction,
};
