const mongoose = require("mongoose");
const joi = require("joi");
const Schema = mongoose.Schema;

const monnifyHistorySchema = new Schema(
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
    resolvedAmount: {
      type: Number,
      default: null,
    },
    old_bal: {
      type: String,
      required: true,
    },
    new_bal: {
      type: String,
      required: true,
    },
    bank: {
      type: String,
      default: null,
    },
    bankAccountNum: {
      type: String,
      default: null,
    },
    purpose: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    pay_type: {
      type: String,
      default: null,
    },
    date_of_payment: {
      type: String,
      default: `${new Date()}`,
    },
    payment_ref: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("monnifyHistory", monnifyHistorySchema);
