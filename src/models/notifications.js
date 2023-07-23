const Joi = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "account",
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["urgent", "info", "critical", "warning", "admin"],
      required: true,
    },
    color: {
      type: String,
    },
    hasRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notification", NotificationSchema);
