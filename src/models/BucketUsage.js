const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bucketUsageSchema = new Schema(
  {
    bucketID: {
      type: Schema.Types.ObjectId,
      ref: "BucketId",
      required: true,
    },
    startOfDayBalance: {
      type: Number,
      required: true,
    },
    endOfDayBalance: {
      type: Number,
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
    status: {
      type: String,
      enum: ["Green", "Red"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BucketUsage", bucketUsageSchema);
