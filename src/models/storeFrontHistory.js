const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storeFrontHistorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    storeBusiness: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      default: null,
    },
    volume: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: null,
    },
    network: {
      type: String,
      default: null,
    },
    date: {
      type: String,
      default: `${new Date()}`,
    },
    transaction_ref: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("storeFrontHistory", storeFrontHistorySchema);
