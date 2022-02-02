const mongoose = require("mongoose");

const accountSchema = mongoose.Schema(
  {
    business_name: String,
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
      unique: true,
      lowercase: true,
    },
    mobile_number: String,
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024,
    },
    token: String,
  },
  { timestamps: true }
);

const Acccount = mongoose.model("account", accountSchema);

module.exports = {
  Acccount,
};
