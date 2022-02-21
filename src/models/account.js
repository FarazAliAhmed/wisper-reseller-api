const Joi = require("joi");
const uuid = require("uuid");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const { create: createEmptyBalance } = require("../services/balance.service");

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
    username: {
      type: String,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024,
    },
    access_token: {
      type: String,
      default: uuid.v4(),
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    mobile_number: String,
    address: String,
  },
  { timestamps: true }
);

// automatically create an empty balance when a business Account is created
accountSchema.post("save", async function () {
  const businessId = this._id;
  await createEmptyBalance(businessId);
});

accountSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      isAdmin: this.isAdmin,
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
    username: Joi.string().min(5).max(10).required(),
    password: Joi.string().min(5).max(255).required(),
    mobile_number: Joi.number().required(),
    address: Joi.string(),
  });

  return schema.validate(user);
};
module.exports = {
  Account,
  validateUser,
};
