const mongoose = require('mongoose')
const joi = require('joi')
const Schema = mongoose.Schema

const PaymentHistory = new Schema({
  business_name: {
    type: String
  },
  business_id: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date_of_payment: {
    type: Date,
    default: Date.now()
  },
  payment_ref: {
    type: String,
    required: true,
    unique: true
  }
})

const validatePayment = () => {

}

module.exports = {
  paymentHistory: mongoose.model('payments', PaymentHistory)
}
