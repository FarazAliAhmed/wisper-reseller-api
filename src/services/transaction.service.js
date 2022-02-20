const { transactionHistory: Transaction } = require('../models/transactionHistory')

// called by admin and gets all for all businesses
const getAllB = async () => {
  const transactions = await Transaction.find().exec()
  if (transactions) return { transactions }
  return { status: 400, messsage: 'Unable to retrieve all Transactions' }
}

// Called by single user for just himself
const getAll = async (id) => {
  const businessId = id
  const transactions = await Transaction.find({business_id: businessId}).exec()
  if (transactions) return { transactions }
  return { status: 400, messsage: 'Unable to retrieve all your Transactions' }
}

const getOne = async (id) => {
  const transaction = await Transaction.find({ _id: id }).exec()
  if (transaction) return { transaction }
  return { status: 400, message: `Unable to find transaction with Id: ${id}` }
}

const create = async (body) => {
  // save to db if validation passes
  let newTransaction = new Transaction(body)

  newTransaction = await newTransaction.save()
  return {transaction: newTransaction}
  // will add try-catch to ensure success of save
  // return { status: 400, messsage: 'Unable to add a Transaction' }
}

const update = async (id, body) => {
  // Find the transaction to be updated

  // update and save data to database

  // Return response
}

const deleteOne = async (id) => {
  const transaction = Transaction.findOneAndDelete({ _id: id }).exec()
  if (transaction) return { transaction, message: 'Successfully deleted transaction' }
  return { status: 400, message: `Error deleteling transaction with id: ${id}` }
}

module.exports = {
  getAllB,
  getAll,
  getOne,
  create,
  update,
  deleteOne
}
