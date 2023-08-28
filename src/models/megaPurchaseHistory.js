const mongoose = require("mongoose");
const joi = require("joi");
const Schema = mongoose.Schema;

const megaPurchaseHistorySchema = new Schema(
  {
    business_id: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
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
    date_of_payment: {
      type: String,
      default: `${new Date()}`,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("megaPurchase", megaPurchaseHistorySchema);
