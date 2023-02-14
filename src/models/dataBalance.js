const mongoose = require("mongoose");
const Joi = require("joi");
const moment = require('moment-timezone')
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
    default: "MB",
    // default: "₦",
  },
  mega_wallet: {
    mtn_sme: {
      type: Number,
      default: 0
    },
    mtn_gifting: {
      type: Number,
      default: 0
    },
    airtel: {
      type: Number,
      default: 0
    },
    glo: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      default: "MB"
    }
  },
  last_purchase: {
    type: String,
    default: moment().tz('Africa/Lagos').format('YYYY/MM/D hh:mm:ss A')
  },
});

module.exports = mongoose.model("balance", dataBalanceSchema);
