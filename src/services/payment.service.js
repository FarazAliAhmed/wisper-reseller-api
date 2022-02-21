const Payment = require("../models/paymentHistory");

const getAll = async (id) => {
  const businessId = id;
  const payments = Payment.find({ business_id: businessId }).exec();
  if (payments) return { payments };
  return { status: 400, message: "Unable to retreive your payments history" };
};

const getAllB = async () => {
  const payments = Payment.find().exec();
  if (payments) return { payments };
  return { status: 400, message: "Unable to retreive payments history" };
};

const getOne = async (id) => {
  const payment = Payment.find({ _id: id }).exec();
  if (payment) return { payment };
  return { status: 400, message: `Unable to retreive payment with id: ${id}` };
};

const create = async (fields) => {
  // save payment to DB
  // Send save payment ass response
};

const update = async (id, fields) => {
  // Get payment to update
  // save changes and return response
};

const deleteOne = async (id) => {
  const payment = Payment.findOneAndDelete({ _id: id }).exec();
  if (payment) return { payment, message: "Successfully deleted payment" };
  return { status: 400, message: `Error deleteling payment with id: ${id}` };
};

module.exports = {
  getAll,
  getAllB,
  getOne,
  create,
  update,
  deleteOne,
};
