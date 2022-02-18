const mongoose = require('mongoose')
const joi = require('joi')
const Schema = mongoose.Schema

const TransactionHistory = new Schema({
  transaction_ref: {
    type: String,
    required: true,
    unique: true
  },
  phone_number: {
    type: String,
    required: true
  },
  data_volume: {
    type: Number
  },
  business_id: {
    type: String,
    required: true
  },
  plan_id: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  network_provider: {
    type: String,
    maxlength: 10
  }
},
{
  timestamp: true
}
)

module.exports = {
  transactionHistory: mongoose.model('transaction', TransactionHistory)
}
