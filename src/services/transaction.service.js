const { transactionHistory: Transaction } = require('../models/transactionHistory')

const getAll = async () => {
  const transactions = await Transaction.find().exec()
  if (transactions) return { transactions }
  return { status: 400, messsage: 'Unable to retrieve all Transactions' }
}

const getOne = async (id) => {
  const transaction = await Transaction.find({ _id: id }).exec()
  if (transaction) return { transaction }
  return { status: 400, message: `Unable to find transaction with Id: ${id}` }
}

const create = async (body) => {
  // save to db if validation passes

  // Return response of success or failure
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
  getAll,
  getOne,
  create,
  update,
  deleteOne
}
