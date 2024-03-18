const Transaction = require("../models/transactionHistory");

// called by admin and gets all for all businesses
const getAllB = async () => {
  const transactions = await Transaction.find()
    .sort({ _id: -1 })
    .limit(100)
    .exec();
  if (transactions) return { transactions };
  return { status: 400, messsage: "Unable to retrieve all Transactions" };
};

// Called by single user for just himself
const getAll = async (id) => {
  const businessId = id;
  const transactions = await Transaction.find({
    business_id: businessId,
  })
    .sort({ _id: -1 })
    .limit(100)
    .exec();
  if (transactions) return { transactions };
  return { status: 400, messsage: "Unable to retrieve all your Transactions" };
};

// Called by single user for just himself
const getAllApi = async (id) => {
  try {
    const businessId = id;
    const transactions = await Transaction.find({
      business_id: businessId,
    })
      .sort({ _id: -1 })
      .limit(100)
      .select("-_id -admin_ref -gloB -business_id -created_at")
      .exec();

    const modifiedTransactions = transactions.map((transaction) => {
      const { new_balance, ...rest } = transaction.toObject(); // Exclude new_balance
      return {
        cashbalance: new_balance.cash_balance, // Access cash_balance directly
        ...rest,
      };
    });

    if (modifiedTransactions.length > 0) {
      return { transactions: modifiedTransactions };
    } else {
      return { status: 404, message: "No transactions found" };
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { status: 500, message: "Internal server error" };
  }
};

const getOne = async (transaction_ref) => {
  const transaction = await Transaction.find({ transaction_ref }).exec();
  if (transaction) return { transaction };
  return {
    status: 400,
    message: `Unable to find transaction with Ref code: ${transaction_ref}`,
  };
};

const getOneApi = async (transaction_ref) => {
  const transaction = await Transaction.findOne({ transaction_ref })
    .select("-_id -admin_ref -gloB -business_id -created_at")
    .exec();

  if (transaction) {
    const { new_balance, ...rest } = transaction.toObject();

    return {
      transaction: {
        cashbalance: new_balance.cash_balance, // Access cash_balance directly
        ...rest,
      },
    };
  }
  return {
    status: 400,
    message: `Unable to find transaction with Ref code: ${transaction_ref}`,
  };
};

const create = async (body) => {
  let newTransaction = new Transaction(body);
  try {
    newTransaction = await newTransaction.save();
    return { transaction: newTransaction };
  } catch (e) {
    console.log("Create Transaction Error: ", e);
  }
};

const update = async (query, body) => {
  let transaction;
  try {
    transaction = await Transaction.findOneAndUpdate(query, body, {
      new: true,
    }).exec();
    if (transaction) return { transaction };
  } catch (e) {
    console.log("Transaction error: ", e);
  }
};

const deleteOne = async (id) => {
  const transaction = Transaction.findOneAndDelete({ _id: id }).exec();
  if (transaction)
    return { transaction, message: "Successfully deleted transaction" };
  return {
    status: 400,
    message: `Error deleteling transaction with id: ${id}`,
  };
};

module.exports = {
  getAllB,
  getAll,
  getAllApi,
  getOneApi,
  getOne,
  create,
  update,
  deleteOne,
};
