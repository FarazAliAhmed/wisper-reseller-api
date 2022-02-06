
const postPayment = async (req, res) => {

}

const getPayment = async (req, res) => {
  const id = req.params.id
}

const getAllPayments = async (req, res) => {

}

const getAllBusinessPayments = async (req, res) => {
  const businessId = req.params.id
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
