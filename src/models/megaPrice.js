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
    glo: {
      type: Number,
      default: 0,
    },
    "9mobile": {
      type: Number,
      default: 0,
    },
    special: {
      type: {
        mtn_sme: {
          type: Number,
          default: 0,
        },
        mtn_gifting: {
          type: Number,
          default: 0,
        },
        "9mobile": {
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
      },
      default: {},
    },
    gloDealer: [
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("MegaPrice", MegaPrice);
