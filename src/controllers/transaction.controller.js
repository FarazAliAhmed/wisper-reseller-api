
const postTransaction = async (req, res) => {

}

const getTransaction = async (req, res) => {
  const transactionId = req.params.id
}

const getAllTransaction = async (req, res) => {

}

const getAllBusinessTransactions = async (req, res) => {
  const businessId = req.params.id
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
