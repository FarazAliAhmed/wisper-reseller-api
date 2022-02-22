const mongoose = require("mongoose");
const joi = require("joi");
const Schema = mongoose.Schema;

const paymentHistorySchema = new Schema({
  business_name: {
    type: String,
  },
  business_id: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date_of_payment: {
    type: Date,
    default: Date.now(),
  },
  payment_ref: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
});

const validatePayment = () => {};

module.exports = mongoose.model("payments", paymentHistorySchema);
