const {getBalance, getAllBalance, credit, upgradeAllBalance} = require('../services/balance.service')

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

const getFieldFromUnit = (unit) => {
  if (unit === "data"){
    return "data_volume"
  }else {
    return "wallet_balance"
  }
}

const creditBalance = async (req, res) => {

  const businessId = req.body.business_id
  const creditAmount = req.body.credit_amount

  // unit: "money" is for lite user type. Which should be the default.
  // unit: "data" is for mega user type

  let unit = req.body.unit || "money"
  let field = getFieldFromUnit(unit)
  
  const newBalance = await credit(businessId, creditAmount, field)
  if (newBalance.error) return res.status(400).json({status: 400, message: "Error. Unable to credit account balance"})
  res.status(newBalance.status).json({status: newBalance.status, message: newBalance.message, newBalance: newBalance.balance})
}

const updateBalance = async (req, res) => {

}

const updateAllBalance = async (req, res) => {
  const allBalance = await upgradeAllBalance()
  if (allBalance.error) return res.status(400).json({status: 400, message: "Error. Unable to upgrade all balance accounts"})
  res.status(allBalance.status).json({status: allBalance.status, message: allBalance.message, allBalance})
}

const resetBalance = async (req, res) => {

}


module.exports = {
  getAccountBalance,
  getAllBusinessBalances,
  updateBalance,
  resetBalance,
  creditBalance,
  updateAllBalance,
}
