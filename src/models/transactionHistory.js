const mongoose = require("mongoose");
const Joi = require("joi");
const Schema = mongoose.Schema;

const transactionHistorySchema = new Schema(
  {
    transaction_ref: {
      type: String,
      required: true,
      unique: true,  //We want the admin allocation reference to be same with that of the business when the admin allocates for a business
      index: true,
    },
    admin_ref: {
      type: String,
      default: null,
    },
    phone_number: {
      type: String,
      required: true,
    },
    data_volume: {
      type: Number,
    },
    price: {
      type: Number,
    },
    data_price: {
      type: Number,
    },
    new_balance: {
      type: Schema.Types.Mixed,
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
      default: `${new Date()}`
    }
  }
);

module.exports = mongoose.model("transaction", transactionHistorySchema);
