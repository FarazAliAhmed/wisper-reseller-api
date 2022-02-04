const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const accountSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
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
    isAdmin: Boolean,
  },
  { timestamps: true }
);

accountSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    config.get("jwtSecret")
  );
  return token;
};

const Account = mongoose.model("account", accountSchema);

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    mobile_number: Joi.number().required(),
  });

  return schema.validate(user);
};
module.exports = {
  Account,
  validateUser,
};
