const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    withdrawalType: {
      type: String,
      enum: ["Bank", "Wallet"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"], // Add withdrawal status options
      default: "pending",
    },
  },
  { timestamps: true }
);

const withdrawalHistory = mongoose.model("WithdrawalHistory", withdrawalSchema);

module.exports = withdrawalHistory;
