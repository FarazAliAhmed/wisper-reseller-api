const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MegaPrice = new Schema(
  {
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
    glo: [
      {
        rangeStart: {
          type: Number,
          required: true,
        },
        rangeEnd: {
          type: Number,
          required: true,
        },
        pricePerGB: {
          type: Number,
          required: true,
        },
      },
    ],
    "9mobile": {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MegaPrice", MegaPrice);
