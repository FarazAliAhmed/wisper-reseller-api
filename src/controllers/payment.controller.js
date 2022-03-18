const {getAll, getAllB, getOne, create, update, deleteOne} = require('../services/payment.service')


const postPayment = async (req, res, next) => {
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
  deletePayment
}
