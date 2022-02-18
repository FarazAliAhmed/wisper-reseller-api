const {getBalance, getAllBalance} = require('../services/balance.service')
// Balance is created when business account is created. Check "post" middleware in balance Schema defination
const getAccountBalance = async (req, res) => {
  const businessId = req.user._id
  const resp = await getBalance(businessId)
  if(resp.balance) return res.status(200).json(resp.balance)
  return res.status(resp.status).json(resp)
}

const getAllBusinessBalances = async (req, res) => {
  const allBalance = await getAllBalance()
  if(allBalance.balances) return res.status(200).json(allBalance.balances)
  return res.status(allBalance.status).json(allBalance)
}

const updateBalance = async (req, res) => {

}

const resetBalance = async (req, res) => {

}


module.exports = {
  getAccountBalance,
  getAllBusinessBalances,
  updateBalance,
  resetBalance
}
