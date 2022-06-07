const mongoose = require('mongoose')
const Balance = require("../models/dataBalance");

const getBalance = async (id) => {
  const business_id = mongoose.Types.ObjectId(id)
  const balance = await Balance.findOne({ business: business_id }).populate('business').exec();
  if (balance) return { balance };
  return {
    status: 500,
    error: true,
    message: `Error getting balance of user with id: ${id}`,
  };
};

const getAllBalance = async () => {
  const balances = await Balance.find().populate('business').exec();
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

// Made use of this as an alternative to migration. Should not be used in production
const upgradeAllBalance = async () => {
  const balance = await Balance.updateMany({},
      {
        $set : {
          "mega_wallet": {
                  mtn_sme: 0,
                  mtn_gifting: 0,
                  airtel: 0,
                  glo: 0,
                  unit: "MB"
          }, data_unit: "₦" 
        }
      },
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
  
  const [parent, child] = field.split(".")
  let checker, wallet_name;
  
  if(child){
    checker = balance[parent][child]
    wallet_name = `in ${child.toUpperCase().replace("_", " ")} wallet`
  }else{
    checker = balance[parent]
    wallet_name = "in wallet"
  }

  if (checker < 0)
    return { error: true, status: 401, message: `Insufficient Balance ${wallet_name}` };
  return { balance, error: false, status: 201 };
};

const reset = async (id) => {
  const balance = Balance.findOneAndUpdate(
    { business: id },
    {
      data_volume: 0,
      mega_wallet: {
        mtn_sme: 0,
        mtn_gifting: 0,
        airtel: 0,
        glo: 0,
      }
    }
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
