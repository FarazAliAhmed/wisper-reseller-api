const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MegaPrice = new Schema(
  {
    business_id: {
      type: String,
      required: true,
      unique: true,
    },
    mtn_sme: {
      type: Number,
      default: 0,
    },
    mtn_gifting: {
      type: Number,
      default: 0,
    },
    airtel: {
      type: Number,
      default: 0,
    },
    glo: {
      type: Number,
      default: 0,
    },
    "9mobile": {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MegaPrice", MegaPrice);
