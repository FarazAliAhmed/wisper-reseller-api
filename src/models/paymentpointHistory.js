const mongoose = require("mongoose");

const paymentpointHistorySchema = new mongoose.Schema(
  {
    business_name: {
      type: String,
      required: true,
    },
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    resolvedAmount: {
      type: Number,
      required: true,
    },
    new_bal: {
      type: String,
      required: true,
    },
    old_bal: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      default: "Funding - PaymentPoint",
    },
    desc: {
      type: String,
      required: true,
    },
    bankAccountNum: {
      type: String,
    },
    bank: {
      type: String,
    },
    pay_type: {
      type: String,
      enum: ["credit", "debit"],
      default: "credit",
    },
    date_of_payment: {
      type: Date,
      default: Date.now,
    },
    payment_ref: {
      type: String,
      required: true,
      unique: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "successful",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
paymentpointHistorySchema.index({ business_id: 1, createdAt: -1 });
paymentpointHistorySchema.index({ payment_ref: 1 });

module.exports = mongoose.model("PaymentpointHistory", paymentpointHistorySchema);
