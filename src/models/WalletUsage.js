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
    },
    endOfDayBalance: {
      type: Object,
    },
    totalFunding: {
      type: Number,
    },
    totalDataPurchase: {
      type: Number,
    },
    totalDataBought: {
      type: Number,
    },
    litAccTrx: {
      type: Number,
    },
    proWalBal: {
      type: Number,
    },
    actWalBal: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["Green", "Red"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletUsage", WalletUsageSchema);
