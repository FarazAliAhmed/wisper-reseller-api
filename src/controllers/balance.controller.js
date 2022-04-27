const {
  getBalance,
  getAllBalance,
  credit,
  debit,
  upgradeAllBalance
} = require('../services/balance.service')

const { superjara_balance } = require('../utils');

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

const creditBalance = async (req, res) => {

  const businessId = req.body.business_id
  const creditAmount = req.body.credit_amount
  
  // unit: "money" is for lite user type. Which should be the default.
  // unit: "data" is for mega user type
  let unit = req.body.unit || "money"
  
  // add field wallet to request body when the unit is in data
  // check dataBalance schema to see proper values for 
  const wallet = req.body.wallet
  const allowedWallets = ["mtn_sme", "mtn_gifting", "airtel", "glo"]

  let field;
  if(unit === "data" && wallet){
    if(allowedWallets.includes(wallet)){
      field = `mega_wallet.${wallet}`
    }else{
      return res.status(400).json({status: 400, message: "This wallet type does not exist. Allowed types are: [\"mtn_sme\", \"mtn_gifting\", \"airtel\", \"glo\"] "})
    }
  }else if(unit === "money"){
    field = "wallet_balance"
  }else {
    return res.status(400).json({status: 400, message: "You must set a 'wallet' field when allocating to a data wallet"})
  }
  
  
  const newBalance = await credit(businessId, creditAmount, field)
  if (newBalance.error) return res.status(400).json({status: 400, message: "Error. Unable to credit account balance"})
  res.status(newBalance.status).json({status: newBalance.status, message: newBalance.message, newBalance: newBalance.balance})
}

const debitBalance = async (req, res) => {

  const businessId = req.body.business_id
  const debitAmount = req.body.debit_amount
  
  let unit = req.body.unit || "money"
  const wallet = req.body.wallet
  const allowedWallets = ["mtn_sme", "mtn_gifting", "airtel", "glo"]

  let field;
  if(unit === "data" && wallet){
    if(allowedWallets.includes(wallet)){
      field = `mega_wallet.${wallet}`
    }else{
      return res.status(400).json({status: 400, message: "This wallet type does not exist. Allowed types are: [\"mtn_sme\", \"mtn_gifting\", \"airtel\", \"glo\"] "})
    }
  }else if(unit === "money"){
    field = "wallet_balance"
  }else {
    return res.status(400).json({status: 400, message: "You must set a 'wallet' field when allocating to a data wallet"})
  } 
  
  const newBalance = await debit(businessId, debitAmount, field)
  if (newBalance.error) return res.status(200).json({status: 200, message: "Warning! Account balance is now negative"})
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

const getApiBalance = async (req, res) => {
  const balanceRes = await superjara_balance()
  if(balanceRes.error) return res.status(400).json({status: "failed", message: balanceRes.message})
  return res.status(200).json(balanceRes)
}


module.exports = {
  getAccountBalance,
  getAllBusinessBalances,
  updateBalance,
  resetBalance,
  creditBalance,
  debitBalance,
  updateAllBalance,
  getApiBalance,
}
