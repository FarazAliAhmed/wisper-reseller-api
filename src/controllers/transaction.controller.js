const {
  getAll,
  getAllB,
  getOne
} = require('../services/transaction.service')

const postTransaction = async (req, res) => {

}

const getTransaction = async (req, res) => {
  // used by both admin and user to get single transaction
  const transaction_ref = req.params.id
  const resp = await getOne(transaction_ref)
  if(resp.transaction) return res.status(200).json(resp.transaction)
  return res.status(resp.status).json(resp)
}

const getAllTransaction = async (req, res) => {
  // used by a single user to get all his transactions
  const businessId = req.user._id
  const resp = await getAll(businessId)
  if (resp.transactions) return res.status(200).json(resp.transactions)
  return res.status(resp.status).json(resp)
  
}

const getAllBusinessTransactions = async (req, res) => {
  // used by admin to get all transactions of businesses
  const resp = await getAllB()
  if (resp.transactions) return res.status(200).json(resp.transactions)
  return res.status(resp.status).json(resp)
}

const updateTransaction = async (req, res) => {
  const transactionId = req.params.id
}

const deleteTransaction = async (req, res) => {
  const transactionId = req.params.id
}

module.exports = {
  getTransaction,
  getAllTransaction,
  postTransaction,
  getAllBusinessTransactions,
  updateTransaction,
  deleteTransaction
}
