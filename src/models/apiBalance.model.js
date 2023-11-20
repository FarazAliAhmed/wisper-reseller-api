const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApiBalanceSchema = new Schema(
  {
    api: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    volume: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApiBalance", ApiBalanceSchema);
