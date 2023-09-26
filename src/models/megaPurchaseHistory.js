const mongoose = require("mongoose");
const joi = require("joi");
const Schema = mongoose.Schema;

const megaPurchaseHistorySchema = new Schema(
  {
    business_id: {
      type: String,
      required: true,
    },
    username: {
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
    old_bal: {
      type: String,
      required: true,
    },
    new_bal: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "failed",
    },
    date_of_payment: {
      type: String,
      default: `${new Date()}`,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("megaPurchase", megaPurchaseHistorySchema);
