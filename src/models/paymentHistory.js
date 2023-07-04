const mongoose = require("mongoose");
const joi = require("joi");
const Schema = mongoose.Schema;

const paymentHistorySchema = new Schema(
  {
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
    old: {
      type: Number,
      required: true,
    },
    new: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    volume: {
      type: String,
      required: true,
    },
    wallet: {
      type: String,
      required: true,
    },
    pay_type: {
      type: String,
      required: true,
    },
    date_of_payment: {
      type: String,
      default: `${new Date()}`,
    },

    payment_ref: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("payments", paymentHistorySchema);
