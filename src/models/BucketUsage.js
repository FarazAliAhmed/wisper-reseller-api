const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bucketUsageSchema = new Schema(
  {
    date: {
      type: String,
      default: new Date(),
    },
    bucketID: {
      type: String,
      required: true,
    },
    startOfDayBalance: {
      type: Object,
      required: true,
    },
    endOfDayBalance: {
      type: Object,
      required: true,
    },
    dataSoldOnGlo: {
      type: Number,
      required: true,
    },
    dataSoldOnWisper: {
      type: Number,
      required: true,
    },
    numberOfTransactions: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    balance2: {
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

module.exports = mongoose.model("BucketUsage", bucketUsageSchema);
