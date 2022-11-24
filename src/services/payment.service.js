const Payment = require("../models/paymentHistory");
const BalanceLog = require('../models/balanceLog')
const { getCurrentTime } = require('../utils').helpers

const getAll = async (id) => {
  const businessId = id;
  const payments = await Payment
                        .find({ business_id: businessId })
                        .sort({_id: -1})
                        .limit(4000)
                        .exec();
  if (payments) return { payments };
  return { status: 400, message: "Unable to retreive your payments history" };
};

const getAllB = async () => {
  const payments = await Payment
                        .find()
                        .sort({_id: -1})
                        .limit(4000)
                        .exec();
  if (payments) return { payments };
  return { status: 400, message: "Unable to retreive payments history" };
};

const getOne = async (payment_ref) => {
  const payment = await Payment.find({ payment_ref }).exec();

  if (payment) {
    const receipt = await BalanceLog.findOne({business: payment.business_id, type: 'CREDIT'}).sort({_id: -1}).exec()
    return { payment, receipt };
  }
  
  return { status: 400, message: `Unable to retreive payment with id: ${id}` };
};

const create = async (fields) => {
  try{
    fields.date_of_payment = getCurrentTime()
    let payment = new Payment(fields)
    payment = await payment.save()
    return {payment}
  }catch(e){
    console.log("Payment Create Error: ", e)
    return { status: 400, message: `Unable to create payment` };
  }
};

const update = async (payment_ref, fields) => {
  let payment;
  try{
    payment = await Payment.findOneAndUpdate({ payment_ref }, fields, {new: true}).exec()
    if (payment) return {payment}
  }catch(e){
    console.log("Error updating payment: ", e)
    return { status: 400, message: `Unable to update payment` };
  }
};

const deleteOne = async (payment_ref) => {
  const payment = await Payment.findOneAndDelete({ payment_ref }).exec();
  if (payment) return { payment, message: "Successfully deleted payment" };
  return { status: 400, message: `Error deleteing payment with id: ${id}` };
};

module.exports = {
  getAll,
  getAllB,
  getOne,
  create,
  update,
  deleteOne,
};
