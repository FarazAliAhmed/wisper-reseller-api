const Joi = require("joi");
const uuid = require("uuid");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const { create: createEmptyBalance } = require("../services/balance.service");
const plan = require("./plan");

const accountSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    business_name: {
      type: String,
      default: null,
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
      index: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    confirmationToken: {
      type: String,
      default: null,
    },
    dealer: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["lite", "mega", "admin", "agent", "glo_dealer", "glo_agent"],
      default: "lite",
    },
    mobile_number: String,
    address: String,

    bankAccounts: [
      {
        bankName: {
          type: String,
          default: null,
        },
        accountNumber: {
          type: String,
          default: null,
        },
        accountName: {
          type: String,
          default: null,
        },
      },
    ],

    glo_almamgt: String,

    whitelistStatus: {
      type: Boolean,
      default: false,
    },
    whitelistIP: {
      type: [String], // Change the type to an array of Strings
      default: [], // Set the default value as an empty array
    },

    // plans: [plan.schema],

    callback: {
      type: String,
      default: null,
    },
    webhook: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// automatically create an empty balance when a business Account is created
accountSchema.post("save", async function () {
  const businessId = this._id;
  await createEmptyBalance(businessId);
});

accountSchema.methods.addBankAccount = async function (bankInfo) {
  this.bankAccounts.push(bankInfo);
  await this.save();
};

accountSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      isAdmin: this.isAdmin,
      type: this.type,
      bankAccounts: this.bankAccounts,
      confirmed: this.confirmed,
    },
    config.get("jwtSecret")
    // { expiresIn: "3m" }
  );
  // const token = jwt.sign(
  //   {
  //     _id: this._id,
  //     username: this.username,
  //     email: this.email,
  //     isAdmin: this.isAdmin,
  //     type: this.type,
  //     bankAccounts: this.bankAccounts,
  //     confirmed: this.confirmed,
  //   },
  //   config.get("jwtSecret"),
  //   { expiresIn: "30m" }
  // );

  // const refreshToken = jwt.sign(
  //   {
  //     _id: this._id,
  //     username: this.username,
  //     email: this.email,
  //     isAdmin: this.isAdmin,
  //     type: this.type,
  //     bankAccounts: this.bankAccounts,
  //     confirmed: this.confirmed,
  //   },
  //   config.get("jwtSecret"),
  //   { expiresIn: "1d" }
  // );
  return token;
};

const Account = mongoose.model("account", accountSchema);

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    business_name: Joi.string().min(3).max(50).optional(),
    email: Joi.string().min(5).max(255).required().email(),
    username: Joi.string().min(5).max(10).required(),
    password: Joi.string().min(5).max(255).required(),
    mobile_number: Joi.number().required(),
    address: Joi.string(),
    // type: Joi.string().valid("lite", "mega", "glo_dealer").default("lite"),
  });

  return schema.validate(user);
};
module.exports = {
  Account,
  validateUser,
};
