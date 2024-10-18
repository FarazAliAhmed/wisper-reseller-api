const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const webhookSchema = new Schema(
  {
    business_id: {
      type: String,
      required: true,
      unique: true,
    },

    url: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("webhook", webhookSchema);
