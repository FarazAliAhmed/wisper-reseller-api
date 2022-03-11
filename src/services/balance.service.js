const { updateMany } = require("../models/dataBalance");
const Balance = require("../models/dataBalance");

const getBalance = async (id) => {
  const balance = await Balance.findOne({ business: id }).exec();
  if (balance) return { balance };
  return {
    status: 500,
    message: `Error getting balance of user with id: ${id}`,
  };
};

const getAllBalance = async () => {
  const balances = await Balance.find().exec();
  if (balances) return { balances };
  return { status: 500, message: `Unable to fetch balances of all accounts` };
};

const create = async (id) => {
  const balance = new Balance({ business: id }); // save the business id to the field that references the business Model
  const savedBalance = await balance.save();
  if (savedBalance)
    return {
      status: 201,
      message: "Empty Data balance for business successfully created",
    };
  return { status: 500, message: "Error creating wallet for business" };
};

const upgradeBalance = async (id) => { //change the unit from MB to ₦
  const balance = await Balance.findOneAndUpdate(
    { business: id },
    { data_unit: "MB", data_volume: 0 },
    { new: true }
  ).exec();

  return {
    balance,
    error: false,
    status: 201,
    message: `Data Balance Unit Updated`,
  };
}

const upgradeAllBalance = async () => {
  const balance = await Balance.updateMany({},
      {$set : {"wallet_balance":0 , data_unit: "₦" }},
      {upsert:false}
    ).exec();

  return {
    balance,
    error: false,
    status: 201,
    message: `All Balance Accounts upgraded`,
  };
}

const credit = async (id, creditAmount, field) => {
  const balance = await Balance.findOneAndUpdate(
    { business: id },
    { $inc: { [field]: creditAmount } },
    { new: true }
  ).exec();

  return {
    balance,
    error: false,
    status: 201,
    message: `Data Balance Updated`,
  };
};

const debit = async (id, debitAmount, field) => {
  const balance = await Balance.findOneAndUpdate(
    { business: id },
    { $inc: { [field] : -1 * debitAmount } },
    { new: true }
  ).exec();
  
  if (balance[field] <= 0)
    return { error: true, status: 401, message: `Insufficient Balance` };
  return { balance, error: false };
};

const reset = async (id) => {
  const balance = Balance.findOneAndUpdate(
    { business: id },
    { data_volume: 0 }
  ).exec();
  if (balance) return { balance };
  return {
    status: 400,
    message: `Error reseting data balance of business with id: ${id}`,
  };
};

module.exports = {
  getBalance,
  getAllBalance,
  create,
  debit,
  credit,
  reset,
  upgradeBalance,
  upgradeAllBalance,
};
