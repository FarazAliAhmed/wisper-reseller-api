const Transaction = require("../models/transactionHistory");

// called by admin and gets all for all businesses
const getAllB = async () => {
  const transactions = await Transaction.find().exec();
  if (transactions) return { transactions };
  return { status: 400, messsage: "Unable to retrieve all Transactions" };
};

// Called by single user for just himself
const getAll = async (id) => {
  const businessId = id;
  const transactions = await Transaction.find({
    business_id: businessId,
  }).exec();
  if (transactions) return { transactions };
  return { status: 400, messsage: "Unable to retrieve all your Transactions" };
};

const getOne = async (transaction_ref) => {
  const transaction = await Transaction.find({ transaction_ref }).exec();
  if (transaction) return { transaction };
  return { status: 400, message: `Unable to find transaction with Ref code: ${transaction_ref}` };
};

const create = async (body) => {
  // save to db if validation passes
  let newTransaction = new Transaction(body);
  try{
    newTransaction = await newTransaction.save();
    return { transaction: newTransaction };
  }catch(e){
    console.log("Create Transaction Error: ", e)
  }
  // will add try-catch to ensure success of save
  // return { status: 400, messsage: 'Unable to add a Transaction' }
};

const update = async (query, body) => {
  // Find the transaction to be updated
  let transaction;
  try{
    transaction = await Transaction.findOneAndUpdate(query, body, { new: true }).exec();
    if(transaction) return {transaction};
  }catch(e){
    console.log("Transaction error: ", e)
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
  getOne,
  create,
  update,
  deleteOne,
};
