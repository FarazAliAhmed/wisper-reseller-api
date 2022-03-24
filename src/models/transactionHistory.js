const mongoose = require("mongoose");
const Joi = require("joi");
const moment = require('moment')
const Schema = mongoose.Schema;

const transactionHistorySchema = new Schema(
  {
    transaction_ref: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
    status: {
      type: String,
      maxlength: 20,
      required: true,
    },
    created_at: {
      type: String,
      default: moment().format('YYYY/MM/D hh:mm:ss A')
    }
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("transaction", transactionHistorySchema);
