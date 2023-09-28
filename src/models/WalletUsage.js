const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WalletUsageSchema = new Schema(
  {
    date: {
      type: String,
      default: new Date(),
    },

    startOfDayBalance: {
      type: Object,
      required: true,
    },
    endOfDayBalance: {
      type: Object,
      required: true,
    },
    totalFunding: {
      type: Number,
      required: true,
    },
    totalDataPurchase: {
      type: Number,
      required: true,
    },
    totalDataBought: {
      type: Number,
      required: true,
    },
    litAccTrx: {
      type: Number,
      required: true,
    },
    proWalBal: {
      type: Number,
      required: true,
    },
    actWalBal: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Green", "Red"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletUsage", WalletUsageSchema);
