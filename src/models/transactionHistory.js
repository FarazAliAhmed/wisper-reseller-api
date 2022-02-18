const mongoose = require("mongoose");
const Joi = require("joi");
const Schema = mongoose.Schema;

const transactionHistorySchema = new Schema(
  {
    transaction_ref: {
      type: String,
      required: true,
      unique: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    data_volume: {
      type: Number,
    },
    data_price: {
      type: Number,
    },
    business_id: {
      type: String,
      required: true,
    },
    network_provider: {
      type: String,
      maxlength: 10,
    },
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("transaction", transactionHistorySchema);
