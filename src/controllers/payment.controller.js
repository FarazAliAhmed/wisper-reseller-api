const {getAll, getAllB, getOne} = require('../services/payment.service')


const postPayment = async (req, res) => {

}

const getPayment = async (req, res) => {
  const id = req.params.id
  const resp = await getOne(id)
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
  const id = req.params.id
  const fields = req.body
}

const deletePayment = async (req, res) => {
  const id = req.params.id
}

module.exports = {
  postPayment,
  getPayment,
  getAllPayments,
  getAllBusinessPayments,
  updatePayment,
  deletePayment
}
