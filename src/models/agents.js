const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AgentsSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "account",
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    // You can add more fields here as needed for subdealer information
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agents", AgentsSchema);
