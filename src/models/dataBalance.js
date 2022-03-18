const mongoose = require("mongoose");
const Joi = require("joi");
const Schema = mongoose.Schema;

const dataBalanceSchema = new Schema({
  business: {
    type: Schema.Types.ObjectId,
    ref: "account",
  },
  data_volume: {
    type: Number,
    default: 0,
  },
  wallet_balance: {
    type: Number,
    default: 0,
  },
  data_unit: {
    type: String,
    default: "₦",
  },
  last_purchase: {
    type: Date,
    default: Date.now(),
  },
});

const validateBalance = () => {};

module.exports = mongoose.model("balance", dataBalanceSchema);
