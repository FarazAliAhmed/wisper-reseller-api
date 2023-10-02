const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storeFrontHistorySchema = new Schema(
  {
    storeId: {
      type: String,
      required: true,
    },
    transaction_ref: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    business_id: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      default: null,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    data_volume: {
      type: Number,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    network: {
      type: String,
      default: null,
    },
    old_bal: {
      type: Number,
      default: null,
    },
    new_bal: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      maxlength: 20,
      required: true,
    },
  },
  { timestamps }
);

module.exports = mongoose.model("storeFrontHistory", storeFrontHistorySchema);
