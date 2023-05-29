const { Account } = require('../models/account');
const {getAll, getAllB, getOne, create, update, deleteOne} = require('../services/payment.service')


const postPayment = async (req, res, next) => {
  const business_id = req.body.business_id
  const account = await Account.findOne({ _id: business_id });
  req.body.username = account.username
  const fields = req.body
  
  const resp = await create(fields)
  if (resp.payment) return res.status(201).json(resp.payment)
  return res.status(resp.status).json(resp)
}

const getPayment = async (req, res) => {
  const payment_ref = req.params.id
  const resp = await getOne(payment_ref)
  if(resp.payment) return res.status(200).json(resp.payment)
  return res.status(resp.status).json(resp)
}

const getAllPayments = async (req, res) => {
  const businessId = req.user._id
  const resp = await getAll(businessId)
  if (resp.payments) return res.status(200).json(resp.payments)
  return res.status(resp.status).json(resp)
}

const getAllBusinessPayments = async (req, res) => {
  const resp = await getAllB()
  if (resp.payments) return res.status(200).json(resp.payments)
  return res.status(resp.status).json(resp)
}

const updatePayment = async (req, res) => {
  const payment_ref = req.params.id
  const fields = req.body
  // validate request body
  const resp = await update(payment_ref, fields)
  if(resp.payment) return res.status(201).json(resp.payment)
  return res.status(resp.status).json(resp)
}

const updatePaymentType = async (req, res) => {
  const { businessId, payType } = req.body;

  try {
    const payment = await Payment.findOneAndUpdate(
      { business_id: businessId },
      { pay_type: payType },
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    return res.json({ message: "Pay Type updated successfully." });
  } catch (error) {
    console.error("Error updating Pay Type:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const deletePayment = async (req, res) => {
  const payment_ref = req.params.id
  const resp = await deleteOne(payment_ref)
  if(resp.payment) return res.status(200).json(resp)
  return res.status(resp.status).json(resp)
}

module.exports = {
  postPayment,
  getPayment,
  getAllPayments,
  getAllBusinessPayments,
  updatePayment,
  deletePayment,
  updatePaymentType
}
