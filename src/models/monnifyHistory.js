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
      required: true,
    },
    old_bal: {
      type: Number,
      required: true,
    },
    new_bal: {
      type: Number,
      required: true,
    },
    bank: {
      type: String,
      required: true,
    },
    bankAccountNum: {
      type: String,
      required: true,
    },
    pay_type: {
      type: String,
      default: "Transfer",
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

module.exports = mongoose.model("monnifyHistory", monnifyHistorySchema);
